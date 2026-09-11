import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { ExamDoc, QuestionDoc } from '@/db/schema';
import { PYTHON_BASICS_QUESTIONS } from '@/db/pythonBasicsQuestions';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const examsCol = db.collection<ExamDoc>(COLLECTIONS.exams);
    const questionsCol = db.collection<QuestionDoc>(COLLECTIONS.questions);
    const examId = 'exam_python_basics_90';

    const now = new Date();
    const startDate = new Date(now.getTime() - 1000 * 60 * 30); // Started 30 mins ago
    const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60); // Active for 60 days

    await examsCol.updateOne(
      { _id: examId },
      {
        $set: {
          title: 'PYTHON BASICS — 90 MCQs',
          description: 'Comprehensive Python Basics MCQ exam covering Comments, Input, Data Types, Arithmetic/Comparison/Logical/Assignment Operators, Precedence, type(), Strings, Slicing, and Exceptions.',
          durationMinutes: 90,
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
          totalMarks: PYTHON_BASICS_QUESTIONS.length,
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
    for (let i = 0; i < PYTHON_BASICS_QUESTIONS.length; i++) {
      const q = PYTHON_BASICS_QUESTIONS[i];
      const questionId = `q_py90_${i + 1}`;

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
      message: `Successfully seeded exam 'PYTHON BASICS — 90 MCQs' with ${insertedCount} questions.`,
      examId,
      questionCount: insertedCount,
    });

  } catch (error: any) {
    console.error('Seed Python Exam Error:', error);
    return NextResponse.json({ error: 'Failed to seed Python Basics exam' }, { status: 500 });
  }
}
