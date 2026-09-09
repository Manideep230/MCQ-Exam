import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { exams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const examList = await db.select().from(exams).where(eq(exams.id, params.id));
    const exam = examList[0];

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const nowIso = new Date().toISOString();

    await db.update(exams).set({
      title: body.title,
      description: body.description,
      durationMinutes: Number(body.durationMinutes),
      startAt: new Date(body.startAt).toISOString(),
      endAt: new Date(body.endAt).toISOString(),
      totalMarks: Number(body.totalMarks),
      showResults: Boolean(body.showResults),
      allowBackNav: Boolean(body.allowBackNav),
      abandonmentTimeoutSeconds: Number(body.abandonmentTimeoutSeconds || 60),
      updatedAt: nowIso,
    }).where(eq(exams.id, params.id));

    return NextResponse.json({ success: true, message: 'Exam updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.delete(exams).where(eq(exams.id, params.id));
    return NextResponse.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
