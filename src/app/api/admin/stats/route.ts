import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { StudentDoc, ExamDoc, AttemptDoc, AnswerDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const totalStudents = await db.collection<StudentDoc>(COLLECTIONS.students).countDocuments();
    const examList = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray();
    const completedAttempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({ status: 'submitted' }).toArray();

    const totalExams = examList.length;
    const now = new Date();
    const scheduledExams = examList.filter(e => new Date(e.startAt) > now).length;
    const activeExams = examList.filter(e => new Date(e.startAt) <= now && new Date(e.endAt) > now).length;

    // Calculate score statistics across all submitted attempts
    let totalScoreSum = 0;
    let highestScore = 0;

    for (const att of completedAttempts) {
      const attAnswers = await db.collection<AnswerDoc>(COLLECTIONS.answers).find({ attemptId: att._id }).toArray();
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
