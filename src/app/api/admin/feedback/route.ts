import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { FeedbackDoc } from '@/db/schema';
import { FEEDBACK_QUESTIONS } from '@/lib/feedbackQuestions';

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
    const allFeedbacks = await db.collection<FeedbackDoc>(COLLECTIONS.feedbacks)
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    let filtered = allFeedbacks;

    if (branchFilter && branchFilter !== 'all') {
      filtered = filtered.filter(f => f.branch?.toLowerCase().includes(branchFilter.toLowerCase()));
    }

    if (query) {
      filtered = filtered.filter(f =>
        f.rollNumber.toLowerCase().includes(query) ||
        f.fullName.toLowerCase().includes(query) ||
        f.branch.toLowerCase().includes(query)
      );
    }

    // Compute aggregated analytics across all filtered feedbacks
    const totalResponses = filtered.length;
    let totalOverallSat = 0;
    let totalTrainer = 0;
    let totalTopic = 0;
    let totalPractical = 0;

    const branchCounts: Record<string, number> = { ECE: 0, EEE: 0, Other: 0 };

    filtered.forEach(f => {
      const b = (f.branch || '').toUpperCase();
      if (b.includes('ECE') || b.includes('ELECTRONICS')) branchCounts.ECE++;
      else if (b.includes('EEE') || b.includes('ELECTRICAL')) branchCounts.EEE++;
      else branchCounts.Other++;

      totalOverallSat += f.summaryStats?.overallSatisfaction || 0;
      totalTrainer += f.summaryStats?.avgTrainerRating || 0;
      totalTopic += f.summaryStats?.avgTopicRating || 0;
      totalPractical += f.summaryStats?.avgPracticalRating || 0;
    });

    const avgOverallSatisfaction = totalResponses > 0 ? Number((totalOverallSat / totalResponses).toFixed(2)) : 0;
    const avgTrainerScore = totalResponses > 0 ? Number((totalTrainer / totalResponses).toFixed(2)) : 0;
    const avgTopicScore = totalResponses > 0 ? Number((totalTopic / totalResponses).toFixed(2)) : 0;
    const avgPracticalScore = totalResponses > 0 ? Number((totalPractical / totalResponses).toFixed(2)) : 0;

    // 1. Topic Evaluation Analytics (Q11 to Q30)
    const topicAnalysis = FEEDBACK_QUESTIONS.filter(q => q.section === 2).map(q => {
      let sum = 0;
      let nonZeroCount = 0;
      let notAttendedCount = 0;

      filtered.forEach(f => {
        const val = Number(f.answers?.[q.id]);
        if (val >= 1 && val <= 5) {
          sum += val;
          nonZeroCount++;
        } else if (val === 0) {
          notAttendedCount++;
        }
      });

      const avgRating = nonZeroCount > 0 ? Number((sum / nonZeroCount).toFixed(2)) : 0;

      return {
        id: q.id,
        number: q.number,
        topicText: q.questionText,
        avgRating,
        responseCount: nonZeroCount,
        notAttendedCount,
      };
    });

    // 2. Trainer Evaluation Analytics (Q31 to Q41)
    const trainerAnalysis = FEEDBACK_QUESTIONS.filter(q => q.section === 3).map(q => {
      let sum = 0;
      let count = 0;

      filtered.forEach(f => {
        const val = Number(f.answers?.[q.id]);
        if (val >= 1 && val <= 5) {
          sum += val;
          count++;
        }
      });

      const avgRating = count > 0 ? Number((sum / count).toFixed(2)) : 0;

      return {
        id: q.id,
        number: q.number,
        questionText: q.questionText,
        avgRating,
        responseCount: count,
      };
    });

    // 3. Practical Evaluation Analytics (Q42 to Q50)
    const practicalAnalysis = FEEDBACK_QUESTIONS.filter(q => q.section === 4 && q.type === 'rating_5').map(q => {
      let sum = 0;
      let count = 0;

      filtered.forEach(f => {
        const val = Number(f.answers?.[q.id]);
        if (val >= 1 && val <= 5) {
          sum += val;
          count++;
        }
      });

      const avgRating = count > 0 ? Number((sum / count).toFixed(2)) : 0;

      return {
        id: q.id,
        number: q.number,
        questionText: q.questionText,
        avgRating,
        responseCount: count,
      };
    });

    // 4. Learning Outcomes Analytics (Q53 to Q60)
    const outcomesAnalysis = FEEDBACK_QUESTIONS.filter(q => q.section === 5 && q.type === 'multiple_choice').map(q => {
      const counts: Record<string, number> = {
        'Yes, independently': 0,
        'Partially, with some help': 0,
        'Not yet': 0,
      };

      filtered.forEach(f => {
        const ans = f.answers?.[q.id];
        if (ans && counts[ans] !== undefined) {
          counts[ans]++;
        }
      });

      return {
        id: q.id,
        number: q.number,
        questionText: q.questionText,
        counts,
      };
    });

    // 5. Project Ideation Analytics (Q62, Q64-Q71)
    const projectAnalysis = FEEDBACK_QUESTIONS.filter(q => q.section === 6 && q.type === 'multiple_choice').map(q => {
      const counts: Record<string, number> = {};
      (q.options || []).forEach(opt => { counts[opt] = 0; });

      filtered.forEach(f => {
        const ans = f.answers?.[q.id];
        if (ans) {
          counts[ans] = (counts[ans] || 0) + 1;
        }
      });

      return {
        id: q.id,
        number: q.number,
        questionText: q.questionText,
        counts,
      };
    });

    // 6. Qualitative Paragraph Feedback (Q73, Q74, Q76, Q77, Q79, Q80, Q81, Q82, Q83)
    const qualitativeQuestions = ['q73', 'q74', 'q76', 'q77', 'q79', 'q80', 'q81', 'q82', 'q83'];
    const qualitativeData: Record<string, { student: string; rollNumber: string; branch: string; text: string }[]> = {};

    qualitativeQuestions.forEach(qId => {
      qualitativeData[qId] = [];
    });

    filtered.forEach(f => {
      qualitativeQuestions.forEach(qId => {
        const text = f.answers?.[qId];
        if (text && typeof text === 'string' && text.trim().length > 0) {
          qualitativeData[qId].push({
            student: f.fullName,
            rollNumber: f.rollNumber,
            branch: f.branch,
            text: text.trim(),
          });
        }
      });
    });

    return NextResponse.json({
      success: true,
      feedbacks: filtered,
      analytics: {
        totalResponses,
        branchCounts,
        avgOverallSatisfaction,
        avgTrainerScore,
        avgTopicScore,
        avgPracticalScore,
        topicAnalysis,
        trainerAnalysis,
        practicalAnalysis,
        outcomesAnalysis,
        projectAnalysis,
        qualitativeData,
      },
    });

  } catch (error: any) {
    console.error('Fetch Admin Feedbacks Error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
  }
}
