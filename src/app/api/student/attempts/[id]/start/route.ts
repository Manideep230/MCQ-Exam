import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { exams, questions, options, attempts, answers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const examId = params.id;
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const examList = await db.select().from(exams).where(eq(exams.id, examId));
    const exam = examList[0];

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const startAt = new Date(exam.startAt);
    const endAt = new Date(exam.endAt);

    // Rule 11: Exam start controlled by SERVER TIME
    if (now < startAt) {
      return NextResponse.json({
        error: `Exam has not started yet. Starts at ${startAt.toLocaleString()}`,
        startsAt: exam.startAt
      }, { status: 400 });
    }

    if (now >= endAt) {
      return NextResponse.json({ error: 'Exam window has closed.' }, { status: 400 });
    }

    // Check existing attempt
    const existingAttempts = await db.select()
      .from(attempts)
      .where(and(eq(attempts.examId, examId), eq(attempts.studentId, session.id)));
    
    let attempt = existingAttempts[0];

    if (attempt) {
      if (attempt.status === 'submitted') {
        return NextResponse.json({ error: 'You have already completed this examination.' }, { status: 400 });
      }

      // Verify server deadline
      const deadline = new Date(attempt.deadlineAt);
      if (now >= deadline || attempt.status === 'expired' || attempt.status === 'abandoned') {
        // Auto mark as submitted/expired
        await db.update(attempts)
          .set({ status: 'expired', submittedAt: attempt.deadlineAt })
          .where(eq(attempts.id, attempt.id));
        return NextResponse.json({ error: 'Exam time has expired.' }, { status: 400 });
      }

      // Update last_seen_at
      await db.update(attempts)
        .set({ lastSeenAt: nowIso, updatedAt: nowIso })
        .where(eq(attempts.id, attempt.id));

    } else {
      // Calculate server deadline: min(now + duration, exam.endAt)
      const durationMs = exam.durationMinutes * 60 * 1000;
      const calcDeadline = new Date(now.getTime() + durationMs);
      const finalDeadline = calcDeadline < endAt ? calcDeadline : endAt;

      const attemptId = `attempt_${examId}_${session.id}_${Date.now()}`;

      await db.insert(attempts).values({
        id: attemptId,
        examId: examId,
        studentId: session.id,
        startedAt: nowIso,
        deadlineAt: finalDeadline.toISOString(),
        lastSeenAt: nowIso,
        status: 'in_progress',
        fullscreenExitCount: 0,
        tabSwitchCount: 0,
      });

      const newAttemptList = await db.select().from(attempts).where(eq(attempts.id, attemptId));
      attempt = newAttemptList[0];
    }

    // Fetch questions for this exam
    const questionList = await db.select().from(questions)
      .where(eq(questions.examId, examId))
      .orderBy(questions.orderIndex);

    // Fetch options for all questions
    const questionIds = questionList.map(q => q.id);
    const optionsList = await db.select().from(options);

    // Fetch saved answers for this attempt
    const savedAnswers = await db.select().from(answers).where(eq(answers.attemptId, attempt.id));
    const answerMap = new Map(savedAnswers.map(a => [a.questionId, {
      selectedOption: a.selectedOption,
      justification: a.justification,
      answeredAt: a.answeredAt
    }]));

    // CRITICAL SECURITY REQUIREMENT #43: Do NOT expose correctOption or AI score to student!
    const sanitizeQuestions = questionList.map(q => {
      const qOptions = optionsList
        .filter(o => o.questionId === q.id)
        .map(o => ({
          optionKey: o.optionKey,
          optionText: o.optionText,
        }))
        .sort((a, b) => a.optionKey.localeCompare(b.optionKey));

      const existingAns = answerMap.get(q.id);

      return {
        id: q.id,
        questionText: q.questionText,
        marks: q.marks,
        orderIndex: q.orderIndex,
        options: qOptions,
        savedAnswer: existingAns ? {
          selectedOption: existingAns.selectedOption,
          justification: existingAns.justification,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        deadlineAt: attempt.deadlineAt,
        lastSeenAt: attempt.lastSeenAt,
        status: attempt.status,
        fullscreenExitCount: attempt.fullscreenExitCount,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        allowBackNav: exam.allowBackNav,
        abandonmentTimeoutSeconds: exam.abandonmentTimeoutSeconds,
      },
      questions: sanitizeQuestions,
      serverTime: nowIso,
    });

  } catch (error: any) {
    console.error('Start Exam Error:', error);
    return NextResponse.json({ error: 'Failed to start or resume exam attempt.' }, { status: 500 });
  }
}
