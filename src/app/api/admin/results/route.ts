import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, StudentDoc, ExamDoc, AnswerDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const examFilter = searchParams.get('examId');
    const query = searchParams.get('q')?.toLowerCase();

    const db = await getDb();
    const allAttempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({}).toArray();
    const allStudents = await db.collection<StudentDoc>(COLLECTIONS.students).find({}).toArray();
    const allExams = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray();
    const allAnswers = await db.collection<AnswerDoc>(COLLECTIONS.answers).find({}).toArray();

    const studentMap = new Map<string, StudentDoc>();
    for (const s of allStudents) {
      studentMap.set(s._id, s);
      studentMap.set(s.rollNumber, s);
      studentMap.set(`student_${s.rollNumber}`, s);
    }

    const examMap = new Map<string, ExamDoc>();
    for (const e of allExams) {
      examMap.set(e._id, e);
    }

    let results = allAttempts.map(att => {
      const student = studentMap.get(att.studentId);
      const exam = examMap.get(att.examId);
      const attAnswers = allAnswers.filter(a => a.attemptId === att._id);

      const score = attAnswers.reduce((sum, a) => sum + (a.finalScore || 0), 0);
      const totalMarks = exam?.totalMarks || 30;
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

      return {
        attemptId: att._id,
        examId: att.examId,
        examTitle: exam?.title || 'Unknown Exam',
        studentId: att.studentId,
        rollNumber: student?.rollNumber || att.studentId,
        studentName: student?.fullName || 'Not Profiled Yet',
        branch: student?.branch || '-',
        collegeName: student?.collegeName || '-',
        status: att.status,
        score,
        totalMarks,
        percentage,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt || att.deadlineAt,
        fullscreenExits: att.fullscreenExitCount,
        tabSwitches: att.tabSwitchCount,
        answeredCount: attAnswers.length,
      };
    });

    if (examFilter && examFilter !== 'all') {
      results = results.filter(r => r.examId === examFilter);
    }

    if (query) {
      results = results.filter(r => 
        r.rollNumber.toLowerCase().includes(query) ||
        r.studentName.toLowerCase().includes(query) ||
        r.branch.toLowerCase().includes(query) ||
        r.examTitle.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Fetch Results Error:', error);
    return NextResponse.json({ error: 'Failed to fetch exam results' }, { status: 500 });
  }
}
