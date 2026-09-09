import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc, QuestionDoc, AttemptDoc, AnswerDoc } from '@/db/schema';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const examId = params.id;
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const db = await getDb();
    const exam = await db.collection<ExamDoc>(COLLECTIONS.exams).findOne({ _id: examId });

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
    let attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({
      examId: examId,
      $or: [{ studentId: session.id }, { studentId: session.identifier }, { studentId: `student_${session.identifier}` }]
    });

    if (attempt) {
      if (attempt.status === 'submitted') {
        return NextResponse.json({ error: 'You have already completed this examination.' }, { status: 400 });
      }

      // Verify server deadline
      const deadline = new Date(attempt.deadlineAt);
      if (now >= deadline || attempt.status === 'expired' || attempt.status === 'abandoned') {
        // Auto mark as submitted/expired
        await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
          { _id: attempt._id },
          { $set: { status: 'expired', submittedAt: attempt.deadlineAt, updatedAt: nowIso } }
        );
        return NextResponse.json({ error: 'Exam time has expired.' }, { status: 400 });
      }

      // Update last_seen_at
      await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
        { _id: attempt._id },
        { $set: { lastSeenAt: nowIso, updatedAt: nowIso } }
      );
    } else {
      // Calculate server deadline: min(now + duration, exam.endAt)
      const durationMs = exam.durationMinutes * 60 * 1000;
      const calcDeadline = new Date(now.getTime() + durationMs);
      const finalDeadline = calcDeadline < endAt ? calcDeadline : endAt;

      const attemptId = `attempt_${examId}_${session.id}_${Date.now()}`;
      const newAttempt: AttemptDoc = {
        _id: attemptId,
        examId: examId,
        studentId: session.id,
        startedAt: nowIso,
        deadlineAt: finalDeadline.toISOString(),
        lastSeenAt: nowIso,
        status: 'in_progress',
        fullscreenExitCount: 0,
        tabSwitchCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await db.collection<AttemptDoc>(COLLECTIONS.attempts).insertOne(newAttempt);
      attempt = newAttempt;
    }

    // Fetch questions for this exam
    const questionList = await db.collection<QuestionDoc>(COLLECTIONS.questions)
      .find({ examId: examId })
      .sort({ orderIndex: 1 })
      .toArray();

    // Fetch saved answers for this attempt
    const savedAnswers = await db.collection<AnswerDoc>(COLLECTIONS.answers)
      .find({ attemptId: attempt._id })
      .toArray();

    const answerMap = new Map(savedAnswers.map(a => [a.questionId, {
      selectedOption: a.selectedOption,
      justification: a.justification,
      answeredAt: a.answeredAt
    }]));

    // CRITICAL SECURITY REQUIREMENT: Do NOT expose correctOption or AI score to student!
    const sanitizeQuestions = questionList.map(q => {
      let qOptions: { optionKey: string; optionText: string }[] = [];
      if (q.options) {
        if (Array.isArray(q.options)) {
          qOptions = q.options;
        } else {
          qOptions = Object.entries(q.options).map(([key, text]) => ({
            optionKey: key,
            optionText: text as string,
          }));
        }
      }

      qOptions.sort((a, b) => a.optionKey.localeCompare(b.optionKey));
      const existingAns = answerMap.get(q._id);

      return {
        id: q._id,
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
        id: attempt._id,
        startedAt: attempt.startedAt,
        deadlineAt: attempt.deadlineAt,
        lastSeenAt: attempt.lastSeenAt,
        status: attempt.status,
        fullscreenExitCount: attempt.fullscreenExitCount,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      exam: {
        id: exam._id,
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
