import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, QuestionDoc, AnswerDoc } from '@/db/schema';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const attemptId = params.id;
  const nowIso = new Date().toISOString();

  try {
    const db = await getDb();
    const attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({ _id: attemptId });

    if (!attempt || (attempt.studentId !== session.id && attempt.studentId !== session.identifier && attempt.studentId !== `student_${session.identifier}`)) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status === 'submitted') {
      return NextResponse.json({ success: true, message: 'Already submitted', redirect: `/student/exam/${attempt.examId}/result` });
    }

    // Fail-safe: read any in-flight answers sent with the submit payload
    try {
      const body = await req.json();
      const answersMap: Record<string, string> = body?.answers || {};
      const questionIds = Object.keys(answersMap).filter(qId => answersMap[qId]);

      if (questionIds.length > 0) {
        // Fetch questions for authoritative evaluation
        const questions = await db.collection<QuestionDoc>(COLLECTIONS.questions)
          .find({ examId: attempt.examId, _id: { $in: questionIds } })
          .toArray();

        const qMap = new Map(questions.map(q => [q._id, q]));

        for (const [qId, selectedOpt] of Object.entries(answersMap)) {
          if (!selectedOpt) continue;
          const cleanOption = selectedOpt.toString().trim().toUpperCase();
          if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(cleanOption)) continue;

          const question = qMap.get(qId);
          if (!question) continue;

          const isCorrect = cleanOption === (question.correctOption || '').toString().trim().toUpperCase();
          const finalScore = isCorrect ? (question.marks || 1) : 0;
          const answerId = `ans_${attemptId}_${qId}`;

          await db.collection<AnswerDoc>(COLLECTIONS.answers).updateOne(
            { attemptId, questionId: qId },
            {
              $set: {
                attemptId,
                questionId: qId,
                selectedOption: cleanOption,
                justification: '',
                aiOptionCorrect: isCorrect,
                aiJustificationQuality: 'Standard MCQ',
                aiJustificationScore: 0,
                finalScore: finalScore,
                aiReason: isCorrect ? 'Correct option selected' : 'Incorrect option selected',
                evaluationStatus: 'completed',
                answeredAt: nowIso,
                updatedAt: nowIso,
              },
              $setOnInsert: {
                _id: answerId,
              }
            },
            { upsert: true }
          );
        }
      }
    } catch (parseErr) {
      // Body may be empty if called without payload, proceed safely
    }

    await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
      { _id: attemptId },
      {
        $set: {
          status: 'submitted',
          submittedAt: nowIso,
          lastSeenAt: nowIso,
          updatedAt: nowIso,
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Examination submitted successfully',
      redirect: `/student/exam/${attempt.examId}/result`,
    });

  } catch (error: any) {
    console.error('Submit Exam Error:', error);
    return NextResponse.json({ error: 'Failed to submit exam.' }, { status: 500 });
  }
}
