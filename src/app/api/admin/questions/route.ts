import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { questions, options, exams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    let qList;
    if (examId) {
      qList = await db.select().from(questions).where(eq(questions.examId, examId)).orderBy(questions.orderIndex);
    } else {
      qList = await db.select().from(questions).orderBy(questions.orderIndex);
    }

    const allOptions = await db.select().from(options);
    const examList = await db.select().from(exams);

    const fullQuestions = qList.map(q => {
      const qOptions = allOptions.filter(o => o.questionId === q.id).sort((a, b) => a.optionKey.localeCompare(b.optionKey));
      const exam = examList.find(e => e.id === q.examId);

      return {
        id: q.id,
        examId: q.examId,
        examTitle: exam?.title || 'Unassigned',
        questionText: q.questionText,
        marks: q.marks,
        correctOption: q.correctOption,
        orderIndex: q.orderIndex,
        options: {
          A: qOptions.find(o => o.optionKey === 'A')?.optionText || '',
          B: qOptions.find(o => o.optionKey === 'B')?.optionText || '',
          C: qOptions.find(o => o.optionKey === 'C')?.optionText || '',
          D: qOptions.find(o => o.optionKey === 'D')?.optionText || '',
        }
      };
    });

    return NextResponse.json({ questions: fullQuestions });
  } catch (error: any) {
    console.error('Fetch Questions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { examId, questionText, optionA, optionB, optionC, optionD, correctOption, marks } = body;

    if (!examId || !questionText?.trim() || !optionA?.trim() || !optionB?.trim() || !optionC?.trim() || !optionD?.trim() || !correctOption) {
      return NextResponse.json({ error: 'Question text, 4 options, and correct option choice are required.' }, { status: 400 });
    }

    const questionId = `q_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Get current max order index for this exam
    const existing = await db.select().from(questions).where(eq(questions.examId, examId));
    const nextOrder = existing.length + 1;

    await db.insert(questions).values({
      id: questionId,
      examId,
      questionText: questionText.trim(),
      marks: Number(marks) || 1,
      correctOption: correctOption as 'A' | 'B' | 'C' | 'D',
      orderIndex: nextOrder,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const optEntries: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = [
      { key: 'A', text: optionA.trim() },
      { key: 'B', text: optionB.trim() },
      { key: 'C', text: optionC.trim() },
      { key: 'D', text: optionD.trim() },
    ];

    for (const opt of optEntries) {
      await db.insert(options).values({
        id: `opt_${questionId}_${opt.key}`,
        questionId,
        optionKey: opt.key,
        optionText: opt.text,
      });
    }

    return NextResponse.json({ success: true, message: 'Question created successfully', questionId });

  } catch (error: any) {
    console.error('Create Question Error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
