import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc } from '@/db/schema';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const attemptId = params.id;
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const db = await getDb();
    const attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({ _id: attemptId });

    if (!attempt || (attempt.studentId !== session.id && attempt.studentId !== session.identifier && attempt.studentId !== `student_${session.identifier}`)) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        expired: true,
        message: `Attempt is ${attempt.status}`
      });
    }

    const deadline = new Date(attempt.deadlineAt);

    // 1. Deadline check
    if (now >= deadline) {
      await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
        { _id: attemptId },
        {
          $set: {
            status: 'expired',
            submittedAt: attempt.deadlineAt,
            updatedAt: nowIso,
          }
        }
      );

      return NextResponse.json({
        status: 'expired',
        expired: true,
        remainingSeconds: 0,
        message: 'Exam duration has ended. Exam auto-submitted.'
      });
    }

    // Update last_seen_at
    await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
      { _id: attemptId },
      {
        $set: {
          lastSeenAt: nowIso,
          updatedAt: nowIso,
        }
      }
    );

    const remainingMs = deadline.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    return NextResponse.json({
      status: 'in_progress',
      expired: false,
      remainingSeconds,
      serverTime: nowIso,
    });

  } catch (error: any) {
    console.error('Heartbeat Error:', error);
    return NextResponse.json({ error: 'Heartbeat update failed' }, { status: 500 });
  }
}
