import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { QuestionDoc, AnswerDoc } from '@/db/schema';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { questionText, optionA, optionB, optionC, optionD, correctOption, marks } = body;
    const nowIso = new Date().toISOString();
    const db = await getDb();

    await db.collection<QuestionDoc>(COLLECTIONS.questions).updateOne(
      { _id: params.id },
      {
        $set: {
          questionText: questionText.trim(),
          correctOption: correctOption as 'A' | 'B' | 'C' | 'D',
          marks: Number(marks) || 1,
          options: {
            A: optionA.trim(),
            B: optionB.trim(),
            C: optionC.trim(),
            D: optionD.trim(),
          },
          updatedAt: nowIso,
        }
      }
    );

    return NextResponse.json({ success: true, message: 'Question updated successfully' });
  } catch (error: any) {
    console.error('Update Question Error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    await db.collection<QuestionDoc>(COLLECTIONS.questions).deleteOne({ _id: params.id });
    await db.collection<AnswerDoc>(COLLECTIONS.answers).deleteMany({ questionId: params.id });

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
