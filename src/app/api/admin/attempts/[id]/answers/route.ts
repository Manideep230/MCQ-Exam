import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, StudentDoc, ExamDoc, QuestionDoc, AnswerDoc } from '@/db/schema';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({ _id: params.id });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: attempt.studentId }, { rollNumber: attempt.studentId }]
    });

    const exam = await db.collection<ExamDoc>(COLLECTIONS.exams).findOne({ _id: attempt.examId });

    const questionList = await db.collection<QuestionDoc>(COLLECTIONS.questions)
      .find({ examId: attempt.examId })
      .sort({ orderIndex: 1 })
      .toArray();

    const allAnswers = await db.collection<AnswerDoc>(COLLECTIONS.answers)
      .find({ attemptId: attempt._id })
      .toArray();

    const answerMap = new Map(allAnswers.map(a => [a.questionId, a]));

    let calculatedScore = 0;

    const items = questionList.map(q => {
      let qOptions: { optionKey: string; optionText: string }[] = [];
      if (q.options) {
        if (Array.isArray(q.options)) {
          qOptions = q.options;
        } else {
          qOptions = Object.entries(q.options).map(([k, v]) => ({
            optionKey: k,
            optionText: v as string,
          }));
        }
      }
      qOptions.sort((a, b) => a.optionKey.localeCompare(b.optionKey));

      const ans = answerMap.get(q._id);

      if (ans) {
        calculatedScore += (ans.finalScore || 0);
      }

      return {
        questionId: q._id,
        questionText: q.questionText,
        marks: q.marks,
        correctOption: q.correctOption,
        options: qOptions,
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
        id: attempt._id,
        _id: attempt._id,
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
        rollNumber: student?.rollNumber || attempt.studentId,
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
