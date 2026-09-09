import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { StudentDoc } from '@/db/schema';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    const db = await getDb();
    let filter: any = {};

    if (query) {
      const regex = new RegExp(query, 'i');
      filter = {
        $or: [
          { rollNumber: regex },
          { fullName: regex },
          { branch: regex },
          { collegeName: regex },
        ]
      };
    }

    const studentList = await db.collection<StudentDoc>(COLLECTIONS.students)
      .find(filter)
      .sort({ rollNumber: 1 })
      .toArray();

    const sanitizedStudents = studentList.map(s => ({
      id: s._id,
      _id: s._id,
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
    const db = await getDb();

    // Check duplicate
    const existing = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({ rollNumber: rollUpper });
    if (existing) {
      return NextResponse.json({ error: `Student with Roll Number ${rollUpper} already exists.` }, { status: 400 });
    }

    const passwordHash = await hashPassword(password.trim());
    const studentId = `student_${rollUpper}`;
    const nowIso = new Date().toISOString();

    const newStudent: StudentDoc = {
      _id: studentId,
      rollNumber: rollUpper,
      passwordHash,
      fullName: null,
      branch: null,
      collegeName: null,
      profileCompleted: false, // Force student first login profile step!
      accountStatus: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await db.collection<StudentDoc>(COLLECTIONS.students).insertOne(newStudent);

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
