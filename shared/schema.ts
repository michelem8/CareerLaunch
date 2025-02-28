import { pgTable, text, serial, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  currentRole: text("current_role"),
  targetRole: text("target_role"),
  skills: json("skills").$type<string[]>().default([]),
  resumeAnalysis: json("resume_analysis").$type<ResumeAnalysis>(),
  preferences: json("preferences").$type<UserPreferences>(),
  hasCompletedSurvey: boolean("has_completed_survey").default(false),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  skills: json("skills").$type<string[]>().default([]),
  difficulty: text("difficulty").notNull(),
});

export type ResumeAnalysis = {
  skills: string[];
  experience: string[];
  education: string[];
  suggestedRoles: string[];
};

export type UserPreferences = {
  preferredIndustries: string[];
  learningStyle: string;
  timeCommitment: string;
};

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const surveySchema = z.object({
  currentRole: z.string().min(1, "Current role is required"),
  targetRole: z.string().min(1, "Target role is required"),
  preferences: z.object({
    preferredIndustries: z.array(z.string()).min(1, "Select at least one industry"),
    learningStyle: z.string().min(1, "Learning style is required"),
    timeCommitment: z.string().min(1, "Time commitment is required"),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
