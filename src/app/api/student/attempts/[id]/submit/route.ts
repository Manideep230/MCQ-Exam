import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { attempts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const attemptId = params.id;
  const nowIso = new Date().toISOString();

  try {
    const attemptList = await db.select().from(attempts).where(eq(attempts.id, attemptId));
    const attempt = attemptList[0];

    if (!attempt || attempt.studentId !== session.id) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status === 'submitted') {
      return NextResponse.json({ success: true, message: 'Already submitted' });
    }

    await db.update(attempts).set({
      status: 'submitted',
      submittedAt: nowIso,
      lastSeenAt: nowIso,
      updatedAt: nowIso,
    }).where(eq(attempts.id, attemptId));

    return NextResponse.json({
      success: true,
      message: 'Examination submitted successfully',
      redirect: `/student/exam/${attempt.examId}/result`,
    });

  } catch (error: any) {
    console.error('Submit Exam Error:', error);
    return NextResponse.json({ error: 'Failed to submit exam.' }, { status: 500 });
  }
}
