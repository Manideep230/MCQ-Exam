import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { FeedbackSettingsDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const db = await getDb();
    let settings = await db.collection<FeedbackSettingsDoc>(COLLECTIONS.feedbackSettings).findOne({ _id: 'feedback_config' });

    if (!settings) {
      settings = {
        _id: 'feedback_config',
        isFormEnabled: true,
        isGoogleFormEnabled: false,
        googleFormUrl: '',
        updatedAt: new Date().toISOString(),
      };
      await db.collection<FeedbackSettingsDoc>(COLLECTIONS.feedbackSettings).insertOne(settings);
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Fetch Feedback Settings Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isFormEnabled, isGoogleFormEnabled, googleFormUrl } = body;

    const db = await getDb();
    const nowIso = new Date().toISOString();

    const updatedSettings: FeedbackSettingsDoc = {
      _id: 'feedback_config',
      isFormEnabled: Boolean(isFormEnabled),
      isGoogleFormEnabled: Boolean(isGoogleFormEnabled),
      googleFormUrl: typeof googleFormUrl === 'string' ? googleFormUrl.trim() : '',
      updatedAt: nowIso,
    };

    await db.collection<FeedbackSettingsDoc>(COLLECTIONS.feedbackSettings).updateOne(
      { _id: 'feedback_config' },
      { $set: updatedSettings },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('Save Feedback Settings Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
