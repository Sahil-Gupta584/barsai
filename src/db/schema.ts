import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial().primaryKey(),
  title: text().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const rapJobs = pgTable('rap_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  topic: text('topic').notNull(),
  status: text('status', {
    enum: ['pending', 'processing', 'done', 'failed'],
  })
    .notNull()
    .default('pending'),
  videoPath: text('video_path'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
