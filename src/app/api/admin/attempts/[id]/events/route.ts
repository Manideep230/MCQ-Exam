import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { examEvents, attempts, students, exams } from '@/db/schema';
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

    const eventsList = await db.select().from(examEvents)
      .where(eq(examEvents.attemptId, attempt.id))
      .orderBy(examEvents.eventTimestamp);

    const studentList = await db.select().from(students).where(eq(students.id, attempt.studentId));
    const student = studentList[0];

    const examList = await db.select().from(exams).where(eq(exams.id, attempt.examId));
    const exam = examList[0];

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt || attempt.deadlineAt,
        lastSeenAt: attempt.lastSeenAt,
        fullscreenExitCount: attempt.fullscreenExitCount,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      student: {
        rollNumber: student?.rollNumber || 'N/A',
        fullName: student?.fullName || 'Not Profiled Yet',
        branch: student?.branch || '-',
      },
      examTitle: exam?.title || 'Unknown Exam',
      events: eventsList.map(e => ({
        id: e.id,
        eventType: e.eventType,
        eventTimestamp: e.eventTimestamp,
        metadata: e.metadata,
      })),
    });

  } catch (error: any) {
    console.error('Fetch Attempt Events Error:', error);
    return NextResponse.json({ error: 'Failed to fetch monitoring events' }, { status: 500 });
  }
}
