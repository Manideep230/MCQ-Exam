import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { exams, attempts, questions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allExams = await db.select().from(exams);
    const studentAttempts = await db.select().from(attempts).where(eq(attempts.studentId, session.id));

    const now = new Date();

    const formattedExams = await Promise.all(allExams.map(async (exam) => {
      const start = new Date(exam.startAt);
      const end = new Date(exam.endAt);

      // Find existing attempt by this student
      const attempt = studentAttempts.find(a => a.examId === exam.id);

      // Count total questions in this exam
      const qList = await db.select({ id: questions.id }).from(questions).where(eq(questions.examId, exam.id));
      const questionCount = qList.length;

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
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        questionCount,
        startAt: exam.startAt,
        endAt: exam.endAt,
        status: computedStatus,
        attempt: attempt ? {
          id: attempt.id,
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
