import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { exams, questions, attempts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const examList = await db.select().from(exams).orderBy(exams.createdAt);

    const fullExams = await Promise.all(examList.map(async (exam) => {
      const qList = await db.select({ id: questions.id }).from(questions).where(eq(questions.examId, exam.id));
      const attList = await db.select({ id: attempts.id }).from(attempts).where(eq(attempts.examId, exam.id));

      return {
        ...exam,
        questionCount: qList.length,
        attemptCount: attList.length,
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

    await db.insert(exams).values({
      id: examId,
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
    });

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
