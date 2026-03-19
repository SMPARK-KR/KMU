import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const guestbook = sqliteTable("guestbook", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  serviceUrl: text("service_url"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
