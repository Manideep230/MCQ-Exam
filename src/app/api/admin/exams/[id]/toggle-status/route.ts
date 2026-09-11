import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc } from '@/db/schema';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const examId = params.id;
    const body = await req.json().catch(() => ({}));
    const db = await getDb();

    const exam = await db.collection<ExamDoc>(COLLECTIONS.exams).findOne({ _id: examId });
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    let newStatus: 'active' | 'disabled' | 'scheduled';
    if (body.status) {
      newStatus = body.status;
    } else {
      // Toggle logic
      newStatus = exam.status === 'disabled' ? 'active' : 'disabled';
    }

    const nowIso = new Date().toISOString();
    await db.collection<ExamDoc>(COLLECTIONS.exams).updateOne(
      { _id: examId },
      { $set: { status: newStatus, updatedAt: nowIso } }
    );

    return NextResponse.json({
      success: true,
      message: `Exam status set to ${newStatus}`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Toggle Exam Status Error:', error);
    return NextResponse.json({ error: 'Failed to update exam status' }, { status: 500 });
  }
}
