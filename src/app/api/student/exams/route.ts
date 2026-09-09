import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc, AttemptDoc, QuestionDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const allExams = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray();
    const studentAttempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({
      $or: [{ studentId: session.id }, { studentId: session.identifier }, { studentId: `student_${session.identifier}` }]
    }).toArray();

    const now = new Date();

    const formattedExams = await Promise.all(allExams.map(async (exam) => {
      const start = new Date(exam.startAt);
      const end = new Date(exam.endAt);

      // Find existing attempt by this student
      const attempt = studentAttempts.find(a => a.examId === exam._id);

      // Count total questions in this exam
      const questionCount = await db.collection<QuestionDoc>(COLLECTIONS.questions).countDocuments({ examId: exam._id });

      let computedStatus: 'Upcoming' | 'Available' | 'Completed' | 'Expired' = 'Upcoming';

      if (attempt?.status === 'submitted') {
        computedStatus = 'Completed';
      } else if (now < start) {
        computedStatus = 'Upcoming';
      } else if (now >= start && now < end) {
        if (attempt?.status === 'in_progress') {
          // Check if active attempt deadline has passed
          const deadline = new Date(attempt.deadlineAt);
          if (now > deadline) {
            computedStatus = 'Expired';
          } else {
            computedStatus = 'Available'; // Active attempt to resume
          }
        } else {
          computedStatus = 'Available';
        }
      } else {
        computedStatus = 'Expired';
      }

      return {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        questionCount,
        startAt: exam.startAt,
        endAt: exam.endAt,
        status: computedStatus,
        attempt: attempt ? {
          id: attempt._id,
          status: attempt.status,
          startedAt: attempt.startedAt,
          deadlineAt: attempt.deadlineAt,
          submittedAt: attempt.submittedAt,
        } : null,
      };
    }));

    return NextResponse.json({ exams: formattedExams, serverTime: now.toISOString() });
  } catch (error: any) {
    console.error('Fetch Exams Error:', error);
    return NextResponse.json({ error: 'Failed to fetch student exams' }, { status: 500 });
  }
}
