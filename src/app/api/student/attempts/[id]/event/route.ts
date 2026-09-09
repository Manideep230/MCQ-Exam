import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { attempts, examEvents } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const attemptId = params.id;
  const nowIso = new Date().toISOString();

  try {
    const { eventType, metadata } = await req.json();

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
    }

    const attemptList = await db.select().from(attempts).where(eq(attempts.id, attemptId));
    const attempt = attemptList[0];

    if (!attempt || attempt.studentId !== session.id) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Log event in database
    const eventId = `evt_${attemptId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    await db.insert(examEvents).values({
      id: eventId,
      attemptId,
      eventType,
      eventTimestamp: nowIso,
      metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {}),
    });

    // Update event counters on attempt
    if (eventType === 'fullscreen_exited') {
      await db.update(attempts).set({
        fullscreenExitCount: sql`${attempts.fullscreenExitCount} + 1`,
        lastSeenAt: nowIso,
        updatedAt: nowIso,
      }).where(eq(attempts.id, attemptId));
    } else if (eventType === 'tab_hidden') {
      await db.update(attempts).set({
        tabSwitchCount: sql`${attempts.tabSwitchCount} + 1`,
        lastSeenAt: nowIso,
        updatedAt: nowIso,
      }).where(eq(attempts.id, attemptId));
    }

    return NextResponse.json({ success: true, eventLogged: eventType });

  } catch (error: any) {
    console.error('Log Event Error:', error);
    return NextResponse.json({ error: 'Failed to log monitoring event' }, { status: 500 });
  }
}
