import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { StudentDoc, ExamDoc, AttemptDoc, QuestionDoc, AnswerDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();

    // 1. Fetch Student User profile
    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: session.id }, { rollNumber: session.identifier }]
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 401 });
    }

    const user = {
      id: student._id,
      rollNumber: student.rollNumber,
      fullName: student.fullName,
      branch: student.branch,
      collegeName: student.collegeName,
      profileCompleted: student.profileCompleted,
    };

    // 2. Fetch Exams with student attempts
    const allExams = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray();
    const studentAttempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({
      $or: [
        { studentId: session.id },
        { studentId: session.identifier },
        { studentId: `student_${session.identifier}` }
      ]
    }).toArray();

    const now = new Date();

    const formattedExams = await Promise.all(allExams.map(async (exam) => {
      const start = new Date(exam.startAt);
      const end = new Date(exam.endAt);

      const attempt = studentAttempts.find(a => a.examId === exam._id);
      const questionCount = await db.collection<QuestionDoc>(COLLECTIONS.questions).countDocuments({ examId: exam._id });

      let computedStatus: 'Upcoming' | 'Available' | 'Completed' | 'Expired' | 'Disabled' = 'Upcoming';
      let score = 0;

      if (exam.status === 'disabled') {
        computedStatus = 'Disabled';
        if (attempt && attempt.status === 'submitted') {
          computedStatus = 'Completed';
          const answers = await db.collection<AnswerDoc>(COLLECTIONS.answers).find({ attemptId: attempt._id }).toArray();
          score = answers.reduce((sum, a) => sum + (a.finalScore || 0), 0);
        }
      } else if (attempt) {
        if (attempt.status === 'submitted') {
          computedStatus = 'Completed';
          const answers = await db.collection<AnswerDoc>(COLLECTIONS.answers).find({ attemptId: attempt._id }).toArray();
          score = answers.reduce((sum, a) => sum + (a.finalScore || 0), 0);
        } else if (now < start) {
          computedStatus = 'Upcoming';
        } else if (now >= start && now < end) {
          if (attempt.status === 'in_progress') {
            const deadline = new Date(attempt.deadlineAt);
            if (now > deadline) {
              computedStatus = 'Expired';
            } else {
              computedStatus = 'Available';
            }
          } else {
            computedStatus = 'Available';
          }
        } else {
          computedStatus = 'Expired';
        }
      } else {
        if (now < start) {
          computedStatus = 'Upcoming';
        } else if (now >= start && now < end) {
          computedStatus = 'Available';
        } else {
          computedStatus = 'Expired';
        }
      }

      const totalMarks = exam.totalMarks || questionCount || 30;
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

      return {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        questionCount,
        startAt: exam.startAt,
        endAt: exam.endAt,
        showResults: exam.showResults,
        status: computedStatus,
        attempt: attempt ? {
          id: attempt._id,
          status: attempt.status,
          startedAt: attempt.startedAt,
          deadlineAt: attempt.deadlineAt,
          submittedAt: attempt.submittedAt,
          score,
          totalMarks,
          percentage,
        } : null,
      };
    }));

    return NextResponse.json({
      success: true,
      user,
      exams: formattedExams,
      serverTime: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Student Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
