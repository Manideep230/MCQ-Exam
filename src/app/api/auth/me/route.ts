import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { StudentDoc, AdminDoc } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const db = await getDb();

  if (session.role === 'student') {
    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: session.id }, { rollNumber: session.identifier }]
    });

    if (!student) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: student._id,
        role: 'student',
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        branch: student.branch,
        collegeName: student.collegeName,
        profileCompleted: student.profileCompleted,
      },
    });
  } else {
    const admin = await db.collection<AdminDoc>(COLLECTIONS.admins).findOne({
      $or: [{ _id: session.id }, { username: session.identifier }]
    });

    if (!admin) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: admin._id,
        role: 'admin',
        username: admin.username,
      },
    });
  }
}
