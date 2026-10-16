import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { AttemptDoc, StudentDoc, ExamDoc, AnswerDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const branchFilter = searchParams.get('branch');
    const query = searchParams.get('q')?.toLowerCase();

    const db = await getDb();
    const [allStudents, allExams, allAttempts, allAnswers] = await Promise.all([
      db.collection<StudentDoc>(COLLECTIONS.students).find({}).toArray(),
      db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray(),
      db.collection<AttemptDoc>(COLLECTIONS.attempts).find({}).toArray(),
      db.collection<AnswerDoc>(COLLECTIONS.answers).find({}).toArray(),
    ]);

    const examMap = new Map<string, ExamDoc>();
    allExams.forEach(e => examMap.set(e._id, e));

    // Group answers by attemptId
    const answersByAttempt = new Map<string, AnswerDoc[]>();
    allAnswers.forEach(ans => {
      const list = answersByAttempt.get(ans.attemptId) || [];
      list.push(ans);
      answersByAttempt.set(ans.attemptId, list);
    });

    // Group attempts by student
    const attemptsByStudent = new Map<string, AttemptDoc[]>();
    allAttempts.forEach(att => {
      const sId = att.studentId;
      const list = attemptsByStudent.get(sId) || [];
      list.push(att);
      attemptsByStudent.set(sId, list);
    });

    // Build student leaderboard entries
    let leaderboard = allStudents.map(student => {
      // Find attempts matching student._id, rollNumber, or student_rollNumber
      const studentAttempts: AttemptDoc[] = [
        ...(attemptsByStudent.get(student._id) || []),
        ...(attemptsByStudent.get(student.rollNumber) || []),
        ...(attemptsByStudent.get(`student_${student.rollNumber}`) || []),
      ];

      // Deduplicate attempts by attempt._id
      const uniqueAttemptsMap = new Map<string, AttemptDoc>();
      studentAttempts.forEach(att => uniqueAttemptsMap.set(att._id, att));
      const attempts = Array.from(uniqueAttemptsMap.values());

      let totalScore = 0;
      let totalMaxMarks = 0;
      let examsCompleted = 0;
      let totalViolations = 0;
      let bestExamPercentage = 0;
      let bestExamTitle = '-';

      const examBreakdowns = attempts.map(att => {
        const exam = examMap.get(att.examId);
        const answers = answersByAttempt.get(att._id) || [];
        const score = answers.reduce((sum, a) => sum + (a.finalScore || 0), 0);
        const totalMarks = exam?.totalMarks || 30;
        const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

        totalViolations += (att.fullscreenExitCount || 0) + (att.tabSwitchCount || 0);

        if (att.status === 'submitted') {
          examsCompleted++;
          totalScore += score;
          totalMaxMarks += totalMarks;

          if (percentage >= bestExamPercentage) {
            bestExamPercentage = percentage;
            bestExamTitle = exam?.title || 'Exam';
          }
        }

        return {
          attemptId: att._id,
          examId: att.examId,
          examTitle: exam?.title || 'Exam',
          score,
          totalMarks,
          percentage,
          status: att.status,
          submittedAt: att.submittedAt || att.deadlineAt,
          violations: (att.fullscreenExitCount || 0) + (att.tabSwitchCount || 0),
        };
      });

      const aggregatePercentage = totalMaxMarks > 0
        ? Math.round((totalScore / totalMaxMarks) * 100)
        : 0;

      return {
        studentId: student._id,
        rollNumber: student.rollNumber,
        fullName: student.fullName || 'Student',
        branch: student.branch || '-',
        collegeName: student.collegeName || 'GMRIT',
        accountStatus: student.accountStatus,
        profileCompleted: student.profileCompleted,
        examsAttempted: attempts.length,
        examsCompleted,
        totalScore,
        totalMaxMarks,
        aggregatePercentage,
        bestExamPercentage,
        bestExamTitle,
        totalViolations,
        examBreakdowns,
      };
    });

    // Filter by branch
    if (branchFilter && branchFilter !== 'all') {
      leaderboard = leaderboard.filter(s =>
        s.branch.toLowerCase().includes(branchFilter.toLowerCase())
      );
    }

    // Filter by query
    if (query) {
      leaderboard = leaderboard.filter(s =>
        s.rollNumber.toLowerCase().includes(query) ||
        s.fullName.toLowerCase().includes(query) ||
        s.branch.toLowerCase().includes(query)
      );
    }

    // Sort: highest totalScore, then highest aggregatePercentage, then examsCompleted
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.aggregatePercentage !== a.aggregatePercentage) return b.aggregatePercentage - a.aggregatePercentage;
      return b.examsCompleted - a.examsCompleted;
    });

    // Assign rank
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // Overview Stats
    const totalStudents = rankedLeaderboard.length;
    const activeStudents = rankedLeaderboard.filter(s => s.examsCompleted > 0).length;
    const avgScore = activeStudents > 0
      ? Math.round(rankedLeaderboard.reduce((sum, s) => sum + s.aggregatePercentage, 0) / activeStudents)
      : 0;

    const topPerformer = rankedLeaderboard.length > 0 && rankedLeaderboard[0].examsCompleted > 0
      ? rankedLeaderboard[0]
      : null;

    return NextResponse.json({
      success: true,
      leaderboard: rankedLeaderboard,
      stats: {
        totalStudents,
        activeStudents,
        totalExamsCount: allExams.length,
        averagePercentage: avgScore,
        topPerformer: topPerformer ? {
          rank: 1,
          name: topPerformer.fullName,
          rollNumber: topPerformer.rollNumber,
          branch: topPerformer.branch,
          totalScore: topPerformer.totalScore,
          aggregatePercentage: topPerformer.aggregatePercentage,
        } : null,
      },
    });

  } catch (error: any) {
    console.error('Fetch Leaderboard Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
