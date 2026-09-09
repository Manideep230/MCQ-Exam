import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, QuestionDoc, AnswerDoc } from '@/db/schema';
import { evaluateJustification } from '@/lib/ai-evaluator';

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

    if (!questionId || !selectedOption || !justification) {
      return NextResponse.json({ error: 'Missing questionId, selectedOption, or justification' }, { status: 400 });
    }

    if (!['A', 'B', 'C', 'D'].includes(selectedOption)) {
      return NextResponse.json({ error: 'Invalid option selected' }, { status: 400 });
    }

    if (justification.trim().length < 15) {
      return NextResponse.json({ error: 'Justification must be at least 15 characters long.' }, { status: 400 });
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

    // Server-side timing check
    const deadline = new Date(attempt.deadlineAt);
    if (now > deadline) {
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

    const getOptText = (key: 'A' | 'B' | 'C' | 'D') => {
      if (!question.options) return '';
      if (Array.isArray(question.options)) {
        const found = (question.options as any[]).find((o: any) => o.optionKey === key);
        return found ? found.optionText : '';
      }
      return (question.options as any)[key] || '';
    };

    // Perform AI evaluation server-side
    const aiResult = await evaluateJustification({
      questionText: question.questionText,
      optionA: getOptText('A'),
      optionB: getOptText('B'),
      optionC: getOptText('C'),
      optionD: getOptText('D'),
      correctOption: question.correctOption,
      studentOption: selectedOption,
      justification: justification.trim(),
      marks: question.marks,
    });

    const answerId = `ans_${attemptId}_${questionId}`;

    await db.collection<AnswerDoc>(COLLECTIONS.answers).updateOne(
      { attemptId, questionId },
      {
        $set: {
          _id: answerId,
          attemptId,
          questionId,
          selectedOption,
          justification: justification.trim(),
          aiOptionCorrect: aiResult.optionCorrect,
          aiJustificationQuality: aiResult.justificationQuality,
          aiJustificationScore: aiResult.justificationScore,
          finalScore: aiResult.finalScore,
          aiReason: aiResult.reason,
          evaluationStatus: aiResult.evaluationStatus,
          answeredAt: nowIso,
          updatedAt: nowIso,
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
