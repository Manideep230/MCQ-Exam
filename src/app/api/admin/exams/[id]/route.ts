import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc, QuestionDoc, AttemptDoc, AnswerDoc, ExamEventDoc } from '@/db/schema';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const exam = await db.collection<ExamDoc>(COLLECTIONS.exams).findOne({ _id: params.id });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ exam: { ...exam, id: exam._id } });
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
    const db = await getDb();

    await db.collection<ExamDoc>(COLLECTIONS.exams).updateOne(
      { _id: params.id },
      {
        $set: {
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
        }
      }
    );

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
    const db = await getDb();
    await db.collection<ExamDoc>(COLLECTIONS.exams).deleteOne({ _id: params.id });
    // Cascade delete related records
    await db.collection<QuestionDoc>(COLLECTIONS.questions).deleteMany({ examId: params.id });
    const attempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({ examId: params.id }).toArray();
    const attemptIds = attempts.map(a => a._id);
    if (attemptIds.length > 0) {
      await db.collection<AttemptDoc>(COLLECTIONS.attempts).deleteMany({ examId: params.id });
      await db.collection<AnswerDoc>(COLLECTIONS.answers).deleteMany({ attemptId: { $in: attemptIds } });
      await db.collection<ExamEventDoc>(COLLECTIONS.examEvents).deleteMany({ attemptId: { $in: attemptIds } });
    }

    return NextResponse.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
