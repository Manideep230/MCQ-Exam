import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { students, admins } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  if (session.role === 'student') {
    const studentList = await db.select().from(students).where(eq(students.id, session.id));
    const student = studentList[0];
    if (!student) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: student.id,
        role: 'student',
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        branch: student.branch,
        collegeName: student.collegeName,
        profileCompleted: student.profileCompleted,
      },
    });
  } else {
    const adminList = await db.select().from(admins).where(eq(admins.id, session.id));
    const admin = adminList[0];
    if (!admin) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: admin.id,
        role: 'admin',
        username: admin.username,
      },
    });
  }
}
