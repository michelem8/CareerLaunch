import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeResume, getSkillGapAnalysis } from "./openai";
import { surveySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/survey", async (req, res) => {
    try {
      console.log("Received survey data:", req.body); // Debug log
      const validatedData = surveySchema.parse(req.body);
      const userId = 1; // In a real app, get from session
      const user = await storage.updateUserSurvey(
        userId,
        validatedData.currentRole,
        validatedData.targetRole,
        validatedData.preferences
      );
      res.json(user);
    } catch (error) {
      console.error("Survey validation error:", error); // Debug log
      res.status(400).json({ error: error.message || "Invalid survey data" });
    }
  });

  app.post("/api/resume/analyze", async (req, res) => {
    try {
      const { resumeText } = z.object({ resumeText: z.string() }).parse(req.body);
      const userId = 1; // In a real app, get from session

      const analysis = await analyzeResume(resumeText);
      const user = await storage.updateUserResumeAnalysis(userId, analysis);

      const skillGap = await getSkillGapAnalysis(analysis.skills, user.targetRole);

      res.json({ user, skillGap });
    } catch (error) {
      res.status(400).json({ error: "Failed to analyze resume" });
    }
  });

  app.get("/api/courses/recommended", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      const courses = await storage.getCoursesBySkills(user.skills);
      res.json(courses);
    } catch (error) {
      res.status(400).json({ error: "Failed to get course recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}