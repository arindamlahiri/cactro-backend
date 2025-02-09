import {
	boolean,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export const cache = pgTable('cache', {
	id: serial('id').primaryKey(),
	key: varchar('key', { length: 1000 }).notNull().unique(),
	value: varchar('value', { length: 2000 }).notNull(),
	isDeleted: boolean('is_deleted').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.$onUpdate(() => new Date())
});

export type InsertCache = typeof cache.$inferInsert;
export type SelectCache = typeof cache.$inferSelect;
