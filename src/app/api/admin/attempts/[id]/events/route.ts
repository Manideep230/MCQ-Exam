import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, ExamEventDoc, StudentDoc, ExamDoc } from '@/db/schema';

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

    const eventsList = await db.collection<ExamEventDoc>(COLLECTIONS.examEvents)
      .find({ attemptId: attempt._id })
      .sort({ eventTimestamp: 1 })
      .toArray();

    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: attempt.studentId }, { rollNumber: attempt.studentId }]
    });

    const exam = await db.collection<ExamDoc>(COLLECTIONS.exams).findOne({ _id: attempt.examId });

    return NextResponse.json({
      attempt: {
        id: attempt._id,
        _id: attempt._id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt || attempt.deadlineAt,
        lastSeenAt: attempt.lastSeenAt,
        fullscreenExitCount: attempt.fullscreenExitCount,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      student: {
        rollNumber: student?.rollNumber || attempt.studentId,
        fullName: student?.fullName || 'Not Profiled Yet',
        branch: student?.branch || '-',
      },
      examTitle: exam?.title || 'Unknown Exam',
      events: eventsList.map(e => ({
        id: e._id,
        _id: e._id,
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
