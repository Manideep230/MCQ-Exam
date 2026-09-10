import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, ExamEventDoc } from '@/db/schema';

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

    const db = await getDb();
    const attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({ _id: attemptId });

    if (!attempt || (attempt.studentId !== session.id && attempt.studentId !== session.identifier && attempt.studentId !== `student_${session.identifier}`)) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Log event in database
    const eventId = `evt_${attemptId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    await db.collection<ExamEventDoc>(COLLECTIONS.examEvents).insertOne({
      _id: eventId,
      attemptId,
      eventType,
      eventTimestamp: nowIso,
      metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {}),
    });

    // Update event counters on attempt
    const updateFields: any = {
      lastSeenAt: nowIso,
      updatedAt: nowIso,
    };
    const incFields: any = {};

    if (eventType === 'fullscreen_exited') {
      incFields.fullscreenExitCount = 1;
    } else if (eventType === 'tab_hidden' || eventType === 'focus_lost' || eventType === 'app_switched' || eventType === 'cursor_left_window') {
      incFields.tabSwitchCount = 1;
    }

    const updateDoc: any = { $set: updateFields };
    if (Object.keys(incFields).length > 0) {
      updateDoc.$inc = incFields;
    }

    await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
      { _id: attemptId },
      updateDoc
    );

    return NextResponse.json({ success: true, eventLogged: eventType });

  } catch (error: any) {
    console.error('Log Event Error:', error);
    return NextResponse.json({ error: 'Failed to log monitoring event' }, { status: 500 });
  }
}
