import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { students, attempts } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    let studentList;
    if (query) {
      studentList = await db.select().from(students)
        .where(or(
          like(students.rollNumber, `%${query}%`),
          like(students.fullName, `%${query}%`),
          like(students.branch, `%${query}%`),
          like(students.collegeName, `%${query}%`)
        ))
        .orderBy(students.rollNumber);
    } else {
      studentList = await db.select().from(students).orderBy(students.rollNumber);
    }

    const sanitizedStudents = studentList.map(s => ({
      id: s.id,
      rollNumber: s.rollNumber,
      fullName: s.fullName || 'Not Profiled Yet',
      branch: s.branch || '-',
      collegeName: s.collegeName || '-',
      profileCompleted: s.profileCompleted,
      accountStatus: s.accountStatus,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ students: sanitizedStudents });
  } catch (error: any) {
    console.error('Fetch Students Error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rollNumber, password } = await req.json();

    if (!rollNumber?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Roll Number and Temporary Password are required.' }, { status: 400 });
    }

    const rollUpper = rollNumber.trim().toUpperCase();

    // Check duplicate
    const existing = await db.select().from(students).where(eq(students.rollNumber, rollUpper));
    if (existing.length > 0) {
      return NextResponse.json({ error: `Student with Roll Number ${rollUpper} already exists.` }, { status: 400 });
    }

    const passwordHash = await hashPassword(password.trim());
    const studentId = `student_${rollUpper}`;

    await db.insert(students).values({
      id: studentId,
      rollNumber: rollUpper,
      passwordHash,
      profileCompleted: false, // Force student first login profile step!
      accountStatus: 'active',
    });

    return NextResponse.json({
      success: true,
      message: `Student account created for ${rollUpper}`,
      student: { id: studentId, rollNumber: rollUpper, profileCompleted: false }
    });

  } catch (error: any) {
    console.error('Create Student Error:', error);
    return NextResponse.json({ error: 'Failed to create student account' }, { status: 500 });
  }
}
