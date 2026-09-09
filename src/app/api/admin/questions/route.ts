import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { QuestionDoc, ExamDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    const db = await getDb();
    const filter = examId ? { examId } : {};

    const qList = await db.collection<QuestionDoc>(COLLECTIONS.questions)
      .find(filter)
      .sort({ orderIndex: 1 })
      .toArray();

    const examList = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray();
    const examMap = new Map(examList.map(e => [e._id, e.title]));

    const fullQuestions = qList.map(q => {
      let optA = '', optB = '', optC = '', optD = '';
      if (q.options) {
        if (Array.isArray(q.options)) {
          optA = (q.options as any[]).find((o: any) => o.optionKey === 'A')?.optionText || '';
          optB = (q.options as any[]).find((o: any) => o.optionKey === 'B')?.optionText || '';
          optC = (q.options as any[]).find((o: any) => o.optionKey === 'C')?.optionText || '';
          optD = (q.options as any[]).find((o: any) => o.optionKey === 'D')?.optionText || '';
        } else {
          optA = (q.options as any).A || '';
          optB = (q.options as any).B || '';
          optC = (q.options as any).C || '';
          optD = (q.options as any).D || '';
        }
      }

      return {
        id: q._id,
        _id: q._id,
        examId: q.examId,
        examTitle: examMap.get(q.examId) || 'Unassigned',
        questionText: q.questionText,
        marks: q.marks,
        correctOption: q.correctOption,
        orderIndex: q.orderIndex,
        options: {
          A: optA,
          B: optB,
          C: optC,
          D: optD,
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
    const db = await getDb();

    // Get current max order index for this exam
    const existingCount = await db.collection<QuestionDoc>(COLLECTIONS.questions).countDocuments({ examId });
    const nextOrder = existingCount + 1;

    const newQuestion: QuestionDoc = {
      _id: questionId,
      examId,
      questionText: questionText.trim(),
      marks: Number(marks) || 1,
      correctOption: correctOption as 'A' | 'B' | 'C' | 'D',
      orderIndex: nextOrder,
      options: {
        A: optionA.trim(),
        B: optionB.trim(),
        C: optionC.trim(),
        D: optionD.trim(),
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await db.collection<QuestionDoc>(COLLECTIONS.questions).insertOne(newQuestion);

    return NextResponse.json({ success: true, message: 'Question created successfully', questionId });

  } catch (error: any) {
    console.error('Create Question Error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
