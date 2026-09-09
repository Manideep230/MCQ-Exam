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
  const nowIso = new Date().toISOString();

  try {
    const db = await getDb();
    const attempt = await db.collection<AttemptDoc>(COLLECTIONS.attempts).findOne({ _id: attemptId });

    if (!attempt || (attempt.studentId !== session.id && attempt.studentId !== session.identifier && attempt.studentId !== `student_${session.identifier}`)) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status === 'submitted') {
      return NextResponse.json({ success: true, message: 'Already submitted' });
    }

    await db.collection<AttemptDoc>(COLLECTIONS.attempts).updateOne(
      { _id: attemptId },
      {
        $set: {
          status: 'submitted',
          submittedAt: nowIso,
          lastSeenAt: nowIso,
          updatedAt: nowIso,
        }
      }
    );

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
