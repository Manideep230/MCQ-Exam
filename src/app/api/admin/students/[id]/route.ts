import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/db';
import { students, attempts, exams, answers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const studentList = await db.select().from(students).where(eq(students.id, params.id));
    const student = studentList[0];

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentAttempts = await db.select().from(attempts).where(eq(attempts.studentId, student.id));
    const examList = await db.select().from(exams);

    const history = await Promise.all(studentAttempts.map(async (att) => {
      const exam = examList.find(e => e.id === att.examId);
      const attAnswers = await db.select().from(answers).where(eq(answers.attemptId, att.id));
      const score = attAnswers.reduce((sum, a) => sum + (a.finalScore || 0), 0);

      return {
        attemptId: att.id,
        examTitle: exam?.title || 'Unknown Exam',
        status: att.status,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt,
        score,
        totalMarks: exam?.totalMarks || 30,
        percentage: exam?.totalMarks ? Math.round((score / exam.totalMarks) * 100) : 0,
        fullscreenExits: att.fullscreenExitCount,
        tabSwitches: att.tabSwitchCount,
      };
    }));

    return NextResponse.json({
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        branch: student.branch,
        collegeName: student.collegeName,
        profileCompleted: student.profileCompleted,
        accountStatus: student.accountStatus,
        createdAt: student.createdAt,
      },
      examHistory: history,
    });

  } catch (error: any) {
    console.error('Get Student Detail Error:', error);
    return NextResponse.json({ error: 'Failed to fetch student details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accountStatus, newPassword, fullName, branch, collegeName } = body;

    const studentList = await db.select().from(students).where(eq(students.id, params.id));
    const student = studentList[0];

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updates: Partial<typeof student> = {
      updatedAt: new Date().toISOString(),
    };

    if (accountStatus && ['active', 'disabled'].includes(accountStatus)) {
      updates.accountStatus = accountStatus;
    }

    if (newPassword && newPassword.trim().length > 0) {
      updates.passwordHash = await hashPassword(newPassword.trim());
    }

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (branch !== undefined) updates.branch = branch.trim();
    if (collegeName !== undefined) updates.collegeName = collegeName.trim();

    await db.update(students).set(updates).where(eq(students.id, params.id));

    return NextResponse.json({ success: true, message: 'Student updated successfully' });

  } catch (error: any) {
    console.error('Update Student Error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.delete(students).where(eq(students.id, params.id));
    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Delete Student Error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
