import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Admins Table
export const admins = sqliteTable('admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Students Table
export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  rollNumber: text('roll_number').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  branch: text('branch'),
  collegeName: text('college_name'),
  profileCompleted: integer('profile_completed', { mode: 'boolean' }).default(false).notNull(),
  accountStatus: text('account_status', { enum: ['active', 'disabled'] }).default('active').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  rollNumberIdx: index('students_roll_number_idx').on(table.rollNumber),
}));

// Exams Table
export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  startAt: text('start_at').notNull(), // ISO Date String
  endAt: text('end_at').notNull(),     // ISO Date String
  totalMarks: integer('total_marks').default(30).notNull(),
  status: text('status', { enum: ['draft', 'scheduled', 'active', 'completed'] }).default('scheduled').notNull(),
  showResults: integer('show_results', { mode: 'boolean' }).default(true).notNull(),
  allowBackNav: integer('allow_back_nav', { mode: 'boolean' }).default(true).notNull(),
  abandonmentTimeoutSeconds: integer('abandonment_timeout_seconds').default(60).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  startAtIdx: index('exams_start_at_idx').on(table.startAt),
  endAtIdx: index('exams_end_at_idx').on(table.endAt),
}));

// Questions Table
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  marks: integer('marks').default(1).notNull(),
  correctOption: text('correct_option', { enum: ['A', 'B', 'C', 'D'] }).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  examIdIdx: index('questions_exam_id_idx').on(table.examId),
}));

// Options Table
export const options = sqliteTable('options', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionKey: text('option_key', { enum: ['A', 'B', 'C', 'D'] }).notNull(),
  optionText: text('option_text').notNull(),
});

// Attempts Table
export const attempts = sqliteTable('attempts', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  startedAt: text('started_at').notNull(), // ISO String
  deadlineAt: text('deadline_at').notNull(), // ISO String
  submittedAt: text('submitted_at'),
  lastSeenAt: text('last_seen_at').notNull(),
  status: text('status', { enum: ['in_progress', 'submitted', 'abandoned', 'expired'] }).default('in_progress').notNull(),
  fullscreenExitCount: integer('fullscreen_exit_count').default(0).notNull(),
  tabSwitchCount: integer('tab_switch_count').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  studentIdIdx: index('attempts_student_id_idx').on(table.studentId),
  examIdIdx: index('attempts_exam_id_idx').on(table.examId),
}));

// Answers Table
export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').notNull().references(() => attempts.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  selectedOption: text('selected_option', { enum: ['A', 'B', 'C', 'D'] }).notNull(),
  justification: text('justification').notNull(),
  aiOptionCorrect: integer('ai_option_correct', { mode: 'boolean' }),
  aiJustificationQuality: text('ai_justification_quality'), // excellent, good, partial, poor, irrelevant, invalid
  aiJustificationScore: integer('ai_justification_score').default(0),
  finalScore: integer('final_score').default(0),
  aiReason: text('ai_reason'),
  evaluationStatus: text('evaluation_status', { enum: ['completed', 'pending', 'failed'] }).default('pending').notNull(),
  answeredAt: text('answered_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  attemptIdIdx: index('answers_attempt_id_idx').on(table.attemptId),
}));

// Exam Events Table
export const examEvents = sqliteTable('exam_events', {
  id: text('id').primaryKey(),
  attemptId: text('attempt_id').notNull().references(() => attempts.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // fullscreen_entered, fullscreen_exited, tab_hidden, tab_visible, focus_lost, heartbeat, auto_submitted
  eventTimestamp: text('event_timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
  metadata: text('metadata'),
});
