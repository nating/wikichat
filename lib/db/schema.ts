import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const scrapedUrls = pgTable('scraped_urls', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  url: text('url').notNull(),
  scrapedAt: timestamp('scraped_at').defaultNow(),
});

export const vectorMetadata = pgTable('vector_metadata', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  url: text('url').notNull(),
  vectorId: text('vector_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
