import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, signToken, setAuthCookie } from '@/lib/auth';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fullName, branch, collegeName } = await req.json();

    if (!fullName?.trim() || !branch?.trim() || !collegeName?.trim()) {
      return NextResponse.json({ error: 'Full Name, Branch, and College Name are required.' }, { status: 400 });
    }

    await db.update(students).set({
      fullName: fullName.trim(),
      branch: branch.trim(),
      collegeName: collegeName.trim(),
      profileCompleted: true,
      updatedAt: new Date().toISOString(),
    }).where(eq(students.id, session.id));

    // Update JWT session cookie with profileCompleted = true
    const updatedToken = await signToken({
      ...session,
      fullName: fullName.trim(),
      profileCompleted: true,
    });

    const response = NextResponse.json({ success: true, redirect: '/student/dashboard' });
    setAuthCookie(response, updatedToken);
    return response;
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Failed to update student profile.' }, { status: 500 });
  }
}
