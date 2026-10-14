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
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const { questionId, selectedOption, justification } = await req.json();

    if (!questionId || !selectedOption) {
      return NextResponse.json({ error: 'Missing questionId or selectedOption' }, { status: 400 });
    }

    const cleanOption = (selectedOption || '').toString().trim().toUpperCase();
    if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(cleanOption)) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 });
    }

    const db = await getDb();

    // Verify attempt
    const attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({ _id: attemptId });

    if (!attempt || (attempt.studentId !== session.id && attempt.studentId !== session.identifier && attempt.studentId !== `student_${session.identifier}`)) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Exam attempt is no longer active.' }, { status: 400 });
    }

    // Server-side timing check with 30s network grace period for in-flight requests
    const deadline = new Date(attempt.deadlineAt);
    const deadlineWithGrace = new Date(deadline.getTime() + 30000);
    if (now > deadlineWithGrace) {
      await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
        { _id: attemptId },
        { $set: { status: 'expired', submittedAt: attempt.deadlineAt, updatedAt: nowIso } }
      );
      return NextResponse.json({ error: 'Exam time has expired. Auto-submitting attempt.' }, { status: 400 });
    }

    // Fetch authoritative question details from MongoDB
    const question = await db.collection<QuestionDoc>(COLLECTIONS.questions).findOne({ _id: questionId });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Evaluate correct MCQ option directly without mandatory justification
    const isCorrect = cleanOption === (question.correctOption || '').toString().trim().toUpperCase();
    const finalScore = isCorrect ? (question.marks || 1) : 0;

    const answerId = `ans_${attemptId}_${questionId}`;

    await db.collection<AnswerDoc>(COLLECTIONS.answers).updateOne(
      { attemptId, questionId },
      {
        $set: {
          attemptId,
          questionId,
          selectedOption: cleanOption,
          justification: (justification || '').trim(),
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

    // Update last_seen_at in attempt
    await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
      { _id: attemptId },
      { $set: { lastSeenAt: nowIso, updatedAt: nowIso } }
    );

    return NextResponse.json({
      success: true,
      message: 'Answer saved successfully',
      questionId,
      selectedOption,
    });

  } catch (error: any) {
    console.error('Save Answer Error:', error);
    return NextResponse.json({ error: 'Failed to save answer.' }, { status: 500 });
  }
}
