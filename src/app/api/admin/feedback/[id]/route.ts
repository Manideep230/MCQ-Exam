import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { FeedbackDoc } from '@/db/schema';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const feedback = await db.collection<FeedbackDoc>(COLLECTIONS.feedbacks).findOne({
      $or: [{ _id: params.id }, { rollNumber: params.id }, { studentId: params.id }]
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch feedback record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    await db.collection<FeedbackDoc>(COLLECTIONS.feedbacks).deleteOne({
      $or: [{ _id: params.id }, { rollNumber: params.id }]
    });

    return NextResponse.json({ success: true, message: 'Feedback record deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
