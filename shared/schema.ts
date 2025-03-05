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
  hasCompletedSurvey: boolean("has_completed_survey").default(false).notNull(),
  surveyStep: integer("survey_step").default(1).notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  skills: json("skills").$type<string[]>().notNull(),
  difficulty: text("difficulty").notNull(),
  industry: text("industry").notNull(),
  learningStyle: text("learning_style").notNull(),
  timeCommitment: text("time_commitment").notNull(),
  level: text("level").notNull(),
});

export const courseSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  description: z.string(),
  platform: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string(),
  skills: z.array(z.string()),
  url: z.string(),
  price: z.string().optional(),
  rating: z.number().optional(),
  aiMatchScore: z.number().optional()
});

export type Course = z.infer<typeof courseSchema>;

export const userPreferencesSchema = z.object({
  preferredIndustries: z.array(z.string()),
  learningStyles: z.array(z.string()),
  timeCommitment: z.string()
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const resumeAnalysisSchema = z.object({
  skills: z.array(z.string()),
  experience: z.array(z.string()),
  education: z.array(z.string()),
  suggestedRoles: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendations: z.array(z.string())
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  currentRole: z.string().nullable(),
  targetRole: z.string().nullable(),
  skills: z.array(z.string()),
  preferences: userPreferencesSchema.nullable(),
  resumeAnalysis: resumeAnalysisSchema.nullable(),
  hasCompletedSurvey: z.boolean(),
  surveyStep: z.number()
});

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const surveySchema = z.object({
  currentRole: z.string(),
  targetRole: z.string(),
  preferences: userPreferencesSchema
});

export const rolesSchema = z.object({
  currentRole: z.string(),
  targetRole: z.string()
});