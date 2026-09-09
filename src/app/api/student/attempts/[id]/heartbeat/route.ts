import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { attempts, exams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const attemptId = params.id;
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const attemptList = await db.select().from(attempts).where(eq(attempts.id, attemptId));
    const attempt = attemptList[0];

    if (!attempt || attempt.studentId !== session.id) {
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
      await db.update(attempts).set({
        status: 'expired',
        submittedAt: attempt.deadlineAt,
        updatedAt: nowIso,
      }).where(eq(attempts.id, attemptId));

      return NextResponse.json({
        status: 'expired',
        expired: true,
        remainingSeconds: 0,
        message: 'Exam duration has ended. Exam auto-submitted.'
      });
    }

    // Update last_seen_at
    await db.update(attempts).set({
      lastSeenAt: nowIso,
      updatedAt: nowIso,
    }).where(eq(attempts.id, attemptId));

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
