// MongoDB document interfaces - these define the shape of documents in each collection

export interface AdminDoc {
  _id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface StudentDoc {
  _id: string;
  rollNumber: string;
  passwordHash: string;
  fullName?: string | null;
  branch?: string | null;
  collegeName?: string | null;
  profileCompleted: boolean;
  accountStatus: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface ExamDoc {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  totalMarks: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  showResults: boolean;
  allowBackNav: boolean;
  abandonmentTimeoutSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDoc {
  _id: string;
  examId: string;
  questionText: string;
  marks: number;
  correctOption: 'A' | 'B' | 'C' | 'D';
  orderIndex: number;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttemptDoc {
  _id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  deadlineAt: string;
  submittedAt?: string | null;
  lastSeenAt: string;
  status: 'in_progress' | 'submitted' | 'abandoned' | 'expired';
  fullscreenExitCount: number;
  tabSwitchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerDoc {
  _id: string;
  attemptId: string;
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  justification: string;
  aiOptionCorrect?: boolean | null;
  aiJustificationQuality?: string | null;
  aiJustificationScore?: number;
  finalScore?: number;
  aiReason?: string | null;
  evaluationStatus: 'completed' | 'pending' | 'failed';
  answeredAt: string;
  updatedAt: string;
}

export interface ExamEventDoc {
  _id: string;
  attemptId: string;
  eventType: string;
  eventTimestamp: string;
  metadata?: string | null;
}
