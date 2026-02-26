import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    boolean,
    jsonb,
    real,
    pgEnum,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'employee']);
export const testStatusEnum = pgEnum('test_status', ['draft', 'active', 'archived']);
export const attemptStatusEnum = pgEnum('attempt_status', ['in_progress', 'completed', 'expired']);

// ─── Users ─────────────────────────────────────────
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('employee').notNull(),
    department: varchar('department', { length: 255 }).default('General'),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Tests ─────────────────────────────────────────
export const tests = pgTable('tests', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }).default('General Ethics'),
    difficulty: varchar('difficulty', { length: 50 }).default('Medium'),
    totalQuestions: integer('total_questions').default(10).notNull(),
    timeLimit: integer('time_limit').default(30), // minutes
    status: testStatusEnum('status').default('active').notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Questions ─────────────────────────────────────
export const questions = pgTable('questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    testId: uuid('test_id').references(() => tests.id, { onDelete: 'cascade' }).notNull(),
    questionText: text('question_text').notNull(),
    scenario: text('scenario'), // Ethics scenario description
    options: jsonb('options').notNull(), // [{id: 'a', text: '...', ethicsWeight: {...}}]
    correctAnswer: varchar('correct_answer', { length: 10 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(), // Integrity, Fairness, etc.
    explanation: text('explanation'),
    difficulty: integer('difficulty').default(3), // 1-5
    orderIndex: integer('order_index').default(0),
});

// ─── Test Attempts ─────────────────────────────────
export const testAttempts = pgTable('test_attempts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    testId: uuid('test_id').references(() => tests.id, { onDelete: 'cascade' }).notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    score: real('score'), // 0-100
    status: attemptStatusEnum('status').default('in_progress').notNull(),
    aiAnalysis: jsonb('ai_analysis'), // Groq-generated analysis
    totalTimeTaken: integer('total_time_taken'), // seconds
});

// ─── Attempt Answers ───────────────────────────────
export const attemptAnswers = pgTable('attempt_answers', {
    id: uuid('id').defaultRandom().primaryKey(),
    attemptId: uuid('attempt_id').references(() => testAttempts.id, { onDelete: 'cascade' }).notNull(),
    questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
    selectedAnswer: varchar('selected_answer', { length: 10 }).notNull(),
    isCorrect: boolean('is_correct').default(false),
    timeTaken: integer('time_taken'), // seconds per question
});

// ─── Ethics Scores (Spider Chart Data) ─────────────
export const ethicsScores = pgTable('ethics_scores', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    attemptId: uuid('attempt_id').references(() => testAttempts.id, { onDelete: 'cascade' }).notNull(),
    integrity: real('integrity').default(0).notNull(),
    fairness: real('fairness').default(0).notNull(),
    accountability: real('accountability').default(0).notNull(),
    transparency: real('transparency').default(0).notNull(),
    respect: real('respect').default(0).notNull(),
    overallScore: real('overall_score').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Test = typeof tests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type EthicsScore = typeof ethicsScores.$inferSelect;
