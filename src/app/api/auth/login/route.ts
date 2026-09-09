import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { students, admins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '@/lib/password';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loginType, identifier, password } = body; // loginType: 'student' | 'admin'

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing required credentials' }, { status: 400 });
    }

    if (loginType === 'admin') {
      const adminList = await db.select().from(admins).where(eq(admins.username, identifier.trim()));
      const admin = adminList[0];

      if (!admin) {
        return NextResponse.json({ error: 'Invalid admin username or password' }, { status: 401 });
      }

      const isValid = await comparePassword(password, admin.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid admin username or password' }, { status: 401 });
      }

      const token = await signToken({
        id: admin.id,
        role: 'admin',
        identifier: admin.username,
      });

      const response = NextResponse.json({ success: true, role: 'admin', redirect: '/admin/dashboard' });
      setAuthCookie(response, token);
      return response;
    } else {
      // Student login
      const rollNumberUpper = identifier.trim().toUpperCase();
      const studentList = await db.select().from(students).where(eq(students.rollNumber, rollNumberUpper));
      const student = studentList[0];

      if (!student) {
        return NextResponse.json({ error: 'Invalid Roll Number or Password' }, { status: 401 });
      }

      if (student.accountStatus === 'disabled') {
        return NextResponse.json({ error: 'Your student account has been disabled by administrator.' }, { status: 403 });
      }

      const isValid = await comparePassword(password, student.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Roll Number or Password' }, { status: 401 });
      }

      const token = await signToken({
        id: student.id,
        role: 'student',
        identifier: student.rollNumber,
        fullName: student.fullName || undefined,
        profileCompleted: student.profileCompleted,
      });

      const redirectPath = student.profileCompleted ? '/student/dashboard' : '/first-login';

      const response = NextResponse.json({
        success: true,
        role: 'student',
        profileCompleted: student.profileCompleted,
        redirect: redirectPath,
      });

      setAuthCookie(response, token);
      return response;
    }
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred during login.' }, { status: 500 });
  }
}
