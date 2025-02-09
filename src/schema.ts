import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

export const cache = pgTable('cache', {
	id: serial('id').primaryKey(),
	key: text('key').notNull().unique(),
	value: text('value').notNull(),
	isDeleted: boolean('is_deleted').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.$onUpdate(() => new Date())
});

export type InsertCache = typeof cache.$inferInsert;
export type SelectCache = typeof cache.$inferSelect;
