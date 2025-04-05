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
