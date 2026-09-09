import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { students, exams, attempts, answers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const studentList = await db.select({ id: students.id }).from(students);
    const examList = await db.select().from(exams);
    const attemptList = await db.select().from(attempts);

    const totalStudents = studentList.length;
    const totalExams = examList.length;

    const now = new Date();
    const scheduledExams = examList.filter(e => new Date(e.startAt) > now).length;
    const activeExams = examList.filter(e => new Date(e.startAt) <= now && new Date(e.endAt) > now).length;
    const completedAttempts = attemptList.filter(a => a.status === 'submitted');

    // Calculate score statistics across all submitted attempts
    let totalScoreSum = 0;
    let highestScore = 0;

    for (const att of completedAttempts) {
      const attAnswers = await db.select({ finalScore: answers.finalScore })
        .from(answers)
        .where(eq(answers.attemptId, att.id));
      
      const score = attAnswers.reduce((sum, a) => sum + (a.finalScore || 0), 0);
      totalScoreSum += score;
      if (score > highestScore) {
        highestScore = score;
      }
    }

    const averageScore = completedAttempts.length > 0 
      ? Number((totalScoreSum / completedAttempts.length).toFixed(1)) 
      : 0;

    return NextResponse.json({
      stats: {
        totalStudents,
        totalExams,
        scheduledExams,
        activeExams,
        completedExams: completedAttempts.length,
        averageScore,
        highestScore,
      }
    });

  } catch (error: any) {
    console.error('Fetch Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
