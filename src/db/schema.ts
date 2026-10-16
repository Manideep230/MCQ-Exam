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
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'disabled';
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
  correctOption: string;
  orderIndex: number;
  options: Record<string, string> | Array<{ optionKey: string; optionText: string }>;
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
  questionOrder?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnswerDoc {
  _id: string;
  attemptId: string;
  questionId: string;
  selectedOption: string;
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

export interface FeedbackDoc {
  _id: string;
  studentId: string;
  rollNumber: string;
  fullName: string;
  branch: string;
  collegeName?: string | null;
  answers: Record<string, any>; // maps q1..q83 to values
  summaryStats: {
    avgTopicRating: number;
    avgTrainerRating: number;
    avgPracticalRating: number;
    overallSatisfaction: number;
    attendance: string;
    priorKnowledge: string;
  };
  submittedAt: string;
  updatedAt: string;
}

export interface FeedbackSettingsDoc {
  _id: string; // 'feedback_config'
  isFormEnabled: boolean;
  isGoogleFormEnabled: boolean;
  googleFormUrl: string;
  updatedAt: string;
}
