import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/db';
import { StudentDoc, AttemptDoc, ExamDoc, AnswerDoc, ExamEventDoc } from '@/db/schema';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: params.id }, { rollNumber: params.id }]
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentAttempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({
      $or: [{ studentId: student._id }, { studentId: student.rollNumber }]
    }).toArray();

    const examList = await db.collection<ExamDoc>(COLLECTIONS.exams).find({}).toArray();
    const examMap = new Map(examList.map(e => [e._id, e]));

    const history = await Promise.all(studentAttempts.map(async (att) => {
      const exam = examMap.get(att.examId);
      const attAnswers = await db.collection<AnswerDoc>(COLLECTIONS.answers).find({ attemptId: att._id }).toArray();
      const score = attAnswers.reduce((sum, a) => sum + (a.finalScore || 0), 0);

      return {
        attemptId: att._id,
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
        id: student._id,
        _id: student._id,
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

    const db = await getDb();
    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: params.id }, { rollNumber: params.id }]
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updates: any = {
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

    await db.collection<StudentDoc>(COLLECTIONS.students).updateOne(
      { _id: student._id },
      { $set: updates }
    );

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
    const db = await getDb();
    const student = await db.collection<StudentDoc>(COLLECTIONS.students).findOne({
      $or: [{ _id: params.id }, { rollNumber: params.id }]
    });

    if (student) {
      await db.collection<StudentDoc>(COLLECTIONS.students).deleteOne({ _id: student._id });
      const attempts = await db.collection<AttemptDoc>(COLLECTIONS.attempts).find({
        $or: [{ studentId: student._id }, { studentId: student.rollNumber }]
      }).toArray();
      const attemptIds = attempts.map(a => a._id);
      if (attemptIds.length > 0) {
        await db.collection<AttemptDoc>(COLLECTIONS.attempts).deleteMany({ _id: { $in: attemptIds } });
        await db.collection<AnswerDoc>(COLLECTIONS.answers).deleteMany({ attemptId: { $in: attemptIds } });
        await db.collection<ExamEventDoc>(COLLECTIONS.examEvents).deleteMany({ attemptId: { $in: attemptIds } });
      }
    }

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Delete Student Error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
