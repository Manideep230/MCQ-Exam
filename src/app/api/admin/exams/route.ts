import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc, QuestionDoc, AttemptDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const examList = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).sort({ createdAt: 1 }).toArray();

    const fullExams = await Promise.all(examList.map(async (exam) => {
      const qCount = await db.collection<QuestionDoc>(COLLECTIONS.questions).countDocuments({ examId: exam._id });
      const attCount = await db.collection<AttemptDoc>(COLLECTIONS.attempts).countDocuments({ examId: exam._id });

      return {
        id: exam._id,
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        startAt: exam.startAt,
        endAt: exam.endAt,
        totalMarks: exam.totalMarks,
        status: exam.status,
        showResults: exam.showResults,
        allowBackNav: exam.allowBackNav,
        abandonmentTimeoutSeconds: exam.abandonmentTimeoutSeconds,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
        questionCount: qCount,
        attemptCount: attCount,
      };
    }));

    return NextResponse.json({ exams: fullExams });
  } catch (error: any) {
    console.error('Fetch Admin Exams Error:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      durationMinutes,
      startAt,
      endAt,
      totalMarks,
      showResults,
      allowBackNav,
      abandonmentTimeoutSeconds,
    } = body;

    if (!title?.trim() || !durationMinutes || !startAt || !endAt) {
      return NextResponse.json({ error: 'Title, Duration, Start Time, and End Time are required.' }, { status: 400 });
    }

    const examId = `exam_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const db = await getDb();

    const newExam: ExamDoc = {
      _id: examId,
      title: title.trim(),
      description: description?.trim() || '',
      durationMinutes: Number(durationMinutes),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      totalMarks: Number(totalMarks) || 30,
      status: 'scheduled',
      showResults: showResults !== undefined ? Boolean(showResults) : true,
      allowBackNav: allowBackNav !== undefined ? Boolean(allowBackNav) : true,
      abandonmentTimeoutSeconds: Number(abandonmentTimeoutSeconds) || 60,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await db.collection<ExamDoc>(COLLECTIONS.exams).insertOne(newExam);

    return NextResponse.json({
      success: true,
      message: 'Exam created successfully',
      examId,
    });

  } catch (error: any) {
    console.error('Create Exam Error:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
