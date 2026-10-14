import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc, QuestionDoc } from '@/db/schema';
import { IOT_SECURITY_QUESTIONS } from '@/db/iotSecurityQuestions';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const examsCol = db.collection<ExamDoc>(COLLECTIONS.exams);
    const questionsCol = db.collection<QuestionDoc>(COLLECTIONS.questions);
    const examId = 'exam_iot_security_part_1';

    const now = new Date();
    const startDate = new Date(now.getTime() - 1000 * 60 * 30); // Started 30 mins ago
    const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60); // Active for 60 days

    await examsCol.updateOne(
      { _id: examId },
      {
        $set: {
          title: 'IoT Security and IoT System Design Exam Part - 1',
          description: 'Comprehensive 120-question examination on IoT Security Fundamentals, Attacks & Threats, Authentication & Digital Certificates, Device & Firmware Security, Network Security, Secure Protocols, System Design, and Cloud Applications.',
          durationMinutes: 60,
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
          totalMarks: IOT_SECURITY_QUESTIONS.length,
          status: 'active',
          showResults: true,
          allowBackNav: true,
          abandonmentTimeoutSeconds: 60,
          updatedAt: now.toISOString(),
        },
        $setOnInsert: {
          createdAt: now.toISOString(),
        }
      },
      { upsert: true }
    );

    let insertedCount = 0;
    for (let i = 0; i < IOT_SECURITY_QUESTIONS.length; i++) {
      const q = IOT_SECURITY_QUESTIONS[i];
      const questionId = `q_iot120_${i + 1}`;

      await questionsCol.updateOne(
        { _id: questionId },
        {
          $set: {
            examId: examId,
            questionText: q.questionText,
            marks: 1,
            correctOption: q.correctOption,
            orderIndex: i + 1,
            options: q.options,
            updatedAt: now.toISOString(),
          },
          $setOnInsert: {
            createdAt: now.toISOString(),
          }
        },
        { upsert: true }
      );
      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded exam 'IoT Security and IoT System Design Exam Part - 1' with ${insertedCount} questions.`,
      examId,
      questionCount: insertedCount,
    });

  } catch (error: any) {
    console.error('Seed IoT Exam Error:', error);
    return NextResponse.json({ error: 'Failed to seed IoT Security exam' }, { status: 500 });
  }
}
