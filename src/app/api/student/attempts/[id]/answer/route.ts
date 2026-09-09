import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { attempts, questions, options, answers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

    // Verify attempt
    const attemptList = await db.select().from(attempts).where(eq(attempts.id, attemptId));
    const attempt = attemptList[0];

    if (!attempt || attempt.studentId !== session.id) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Exam attempt is no longer active.' }, { status: 400 });
    }

    // Server-side timing check
    const deadline = new Date(attempt.deadlineAt);
    if (now > deadline) {
      await db.update(attempts).set({ status: 'expired', submittedAt: attempt.deadlineAt }).where(eq(attempts.id, attempt.id));
      return NextResponse.json({ error: 'Exam time has expired. Auto-submitting attempt.' }, { status: 400 });
    }

    // Fetch authoritative question details from SQLite
    const questionList = await db.select().from(questions).where(eq(questions.id, questionId));
    const question = questionList[0];

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const questionOptions = await db.select().from(options).where(eq(options.questionId, questionId));
    const getOptText = (key: 'A' | 'B' | 'C' | 'D') => questionOptions.find(o => o.optionKey === key)?.optionText || '';

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

    // Check if answer record exists
    const existingAnsList = await db.select().from(answers)
      .where(and(eq(answers.attemptId, attemptId), eq(answers.questionId, questionId)));
    const existingAns = existingAnsList[0];

    if (existingAns) {
      await db.update(answers).set({
        selectedOption,
        justification: justification.trim(),
        aiOptionCorrect: aiResult.optionCorrect,
        aiJustificationQuality: aiResult.justificationQuality,
        aiJustificationScore: aiResult.justificationScore,
        finalScore: aiResult.finalScore,
        aiReason: aiResult.reason,
        evaluationStatus: aiResult.evaluationStatus,
        updatedAt: nowIso,
      }).where(eq(answers.id, existingAns.id));
    } else {
      const answerId = `ans_${attemptId}_${questionId}`;
      try {
        await db.insert(answers).values({
          id: answerId,
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
        });
      } catch (insertErr) {
        // Fallback update if record was created concurrently
        await db.update(answers).set({
          selectedOption,
          justification: justification.trim(),
          aiOptionCorrect: aiResult.optionCorrect,
          aiJustificationQuality: aiResult.justificationQuality,
          aiJustificationScore: aiResult.justificationScore,
          finalScore: aiResult.finalScore,
          aiReason: aiResult.reason,
          evaluationStatus: aiResult.evaluationStatus,
          updatedAt: nowIso,
        }).where(and(eq(answers.attemptId, attemptId), eq(answers.questionId, questionId)));
      }
    }

    // Update last_seen_at in attempt
    await db.update(attempts).set({ lastSeenAt: nowIso, updatedAt: nowIso }).where(eq(attempts.id, attemptId));

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
