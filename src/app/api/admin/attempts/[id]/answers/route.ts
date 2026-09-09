import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { attempts, students, exams, questions, options, answers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const attemptList = await db.select().from(attempts).where(eq(attempts.id, params.id));
    const attempt = attemptList[0];

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const studentList = await db.select().from(students).where(eq(students.id, attempt.studentId));
    const student = studentList[0];

    const examList = await db.select().from(exams).where(eq(exams.id, attempt.examId));
    const exam = examList[0];

    const questionList = await db.select().from(questions)
      .where(eq(questions.examId, attempt.examId))
      .orderBy(questions.orderIndex);

    const allOptions = await db.select().from(options);
    const allAnswers = await db.select().from(answers).where(eq(answers.attemptId, attempt.id));

    const answerMap = new Map(allAnswers.map(a => [a.questionId, a]));

    let calculatedScore = 0;

    const items = questionList.map(q => {
      const qOptions = allOptions.filter(o => o.questionId === q.id).sort((a, b) => a.optionKey.localeCompare(b.optionKey));
      const ans = answerMap.get(q.id);

      if (ans) {
        calculatedScore += (ans.finalScore || 0);
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        marks: q.marks,
        correctOption: q.correctOption,
        options: qOptions.map(o => ({ optionKey: o.optionKey, optionText: o.optionText })),
        studentAnswer: ans ? {
          selectedOption: ans.selectedOption,
          justification: ans.justification,
          aiOptionCorrect: ans.aiOptionCorrect,
          aiJustificationQuality: ans.aiJustificationQuality,
          aiJustificationScore: ans.aiJustificationScore,
          finalScore: ans.finalScore,
          aiReason: ans.aiReason,
          evaluationStatus: ans.evaluationStatus,
          answeredAt: ans.answeredAt,
        } : null,
      };
    });

    const totalMarks = exam?.totalMarks || 30;
    const percentage = totalMarks > 0 ? Math.round((calculatedScore / totalMarks) * 100) : 0;

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt || attempt.deadlineAt,
        fullscreenExitCount: attempt.fullscreenExitCount,
        tabSwitchCount: attempt.tabSwitchCount,
        score: calculatedScore,
        totalMarks,
        percentage,
      },
      student: {
        rollNumber: student?.rollNumber || 'N/A',
        fullName: student?.fullName || 'Not Profiled Yet',
        branch: student?.branch || '-',
        collegeName: student?.collegeName || '-',
      },
      exam: {
        title: exam?.title || 'Unknown Exam',
        durationMinutes: exam?.durationMinutes || 60,
      },
      items,
    });

  } catch (error: any) {
    console.error('Fetch Answer Sheet Error:', error);
    return NextResponse.json({ error: 'Failed to fetch answer sheet' }, { status: 500 });
  }
}
