import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { questions, options } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { questionText, optionA, optionB, optionC, optionD, correctOption, marks } = body;
    const nowIso = new Date().toISOString();

    await db.update(questions).set({
      questionText: questionText.trim(),
      correctOption: correctOption as 'A' | 'B' | 'C' | 'D',
      marks: Number(marks) || 1,
      updatedAt: nowIso,
    }).where(eq(questions.id, params.id));

    const optMap: Record<'A' | 'B' | 'C' | 'D', string> = {
      A: optionA.trim(),
      B: optionB.trim(),
      C: optionC.trim(),
      D: optionD.trim(),
    };

    for (const key of ['A', 'B', 'C', 'D'] as ('A' | 'B' | 'C' | 'D')[]) {
      await db.update(options).set({
        optionText: optMap[key],
      }).where(and(eq(options.questionId, params.id), eq(options.optionKey, key)));
    }

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
    await db.delete(questions).where(eq(questions.id, params.id));
    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
