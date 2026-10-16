import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { StudentDoc, FeedbackDoc, FeedbackSettingsDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized. Student session required.' }, { status: 401 });
  }

  try {
    const db = await getDb();

    // 1. Fetch Student details
    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: session.id }, { rollNumber: session.identifier }]
    });

    // 2. Fetch Feedback Settings
    let settings = await db.collection<FeedbackSettingsDoc>(COLLECTIONS.feedbackSettings).findOne({ _id: 'feedback_config' });
    if (!settings) {
      settings = {
        _id: 'feedback_config',
        isFormEnabled: true,
        isGoogleFormEnabled: false,
        googleFormUrl: '',
        updatedAt: new Date().toISOString(),
      };
    }

    // 3. Fetch existing feedback submission if any
    const existingFeedback = await db.collection<FeedbackDoc>(COLLECTIONS.feedbacks).findOne({
      $or: [
        { studentId: session.id },
        { rollNumber: session.identifier },
        { studentId: student?._id }
      ]
    });

    return NextResponse.json({
      success: true,
      settings: {
        isFormEnabled: settings.isFormEnabled,
        isGoogleFormEnabled: settings.isGoogleFormEnabled,
        googleFormUrl: settings.googleFormUrl || '',
      },
      student: {
        id: student?._id || session.id,
        rollNumber: student?.rollNumber || session.identifier,
        fullName: student?.fullName || session.fullName || '',
        branch: student?.branch || '',
        collegeName: student?.collegeName || 'GMR Institute of Technology (GMRIT)',
      },
      existingFeedback: existingFeedback || null,
    });
  } catch (error: any) {
    console.error('Fetch Student Feedback Error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback details' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized. Student session required.' }, { status: 401 });
  }

  try {
    const db = await getDb();

    // Check if form is enabled
    const settings = await db.collection<FeedbackSettingsDoc>(COLLECTIONS.feedbackSettings).findOne({ _id: 'feedback_config' });
    if (settings && !settings.isFormEnabled) {
      return NextResponse.json({ error: 'Feedback form submission is currently closed by the administrator.' }, { status: 403 });
    }

    const body = await req.json();
    const answers: Record<string, any> = body.answers || {};

    if (!answers.q1 || !answers.q2 || !answers.q3) {
      return NextResponse.json({ error: 'Please provide required student details (Name, Roll Number, Branch).' }, { status: 400 });
    }

    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: session.id }, { rollNumber: session.identifier }]
    });

    const nowIso = new Date().toISOString();
    const studentId = student?._id || session.id;
    const rollNumber = (answers.q2 || student?.rollNumber || session.identifier).toString().trim().toUpperCase();
    const fullName = (answers.q1 || student?.fullName || session.fullName || '').toString().trim();
    const branch = (answers.q3 || student?.branch || '').toString().trim();
    const collegeName = student?.collegeName || 'GMR Institute of Technology (GMRIT)';

    // Compute summary statistics
    // 1. Topic ratings (q11 to q30) - ratings 1-5 (0 is Not Attended)
    const topicRatings: number[] = [];
    for (let i = 11; i <= 30; i++) {
      const val = Number(answers[`q${i}`]);
      if (val >= 1 && val <= 5) {
        topicRatings.push(val);
      }
    }
    const avgTopicRating = topicRatings.length > 0
      ? Number((topicRatings.reduce((a, b) => a + b, 0) / topicRatings.length).toFixed(2))
      : 0;

    // 2. Trainer ratings (q31 to q41) - ratings 1-5
    const trainerRatings: number[] = [];
    for (let i = 31; i <= 41; i++) {
      const val = Number(answers[`q${i}`]);
      if (val >= 1 && val <= 5) {
        trainerRatings.push(val);
      }
    }
    const avgTrainerRating = trainerRatings.length > 0
      ? Number((trainerRatings.reduce((a, b) => a + b, 0) / trainerRatings.length).toFixed(2))
      : 0;

    // 3. Practical ratings (q42 to q50) - ratings 1-5
    const practicalRatings: number[] = [];
    for (let i = 42; i <= 50; i++) {
      const val = Number(answers[`q${i}`]);
      if (val >= 1 && val <= 5) {
        practicalRatings.push(val);
      }
    }
    const avgPracticalRating = practicalRatings.length > 0
      ? Number((practicalRatings.reduce((a, b) => a + b, 0) / practicalRatings.length).toFixed(2))
      : 0;

    // 4. Overall Satisfaction (q75)
    const overallSatisfaction = Number(answers.q75) || 5;

    const feedbackDoc: FeedbackDoc = {
      _id: `fb_${rollNumber}`,
      studentId,
      rollNumber,
      fullName,
      branch,
      collegeName,
      answers,
      summaryStats: {
        avgTopicRating,
        avgTrainerRating,
        avgPracticalRating,
        overallSatisfaction,
        attendance: answers.q9 || 'Above 90%',
        priorKnowledge: answers.q10 || 'Beginner',
      },
      submittedAt: nowIso,
      updatedAt: nowIso,
    };

    await db.collection<FeedbackDoc>(COLLECTIONS.feedbacks).updateOne(
      { $or: [{ studentId }, { rollNumber }] },
      { $set: feedbackDoc },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your valuable feedback!',
      feedback: feedbackDoc,
    });
  } catch (error: any) {
    console.error('Submit Feedback Error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
