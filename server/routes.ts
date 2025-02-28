import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeResume, getSkillGapAnalysis } from "./openai";
import { surveySchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid user data" });
    }
  });

  app.post("/api/survey", async (req, res) => {
    try {
      console.log("Received survey data:", req.body); // Debug log
      const validatedData = surveySchema.parse(req.body);
      const userId = 1; // In a real app, get from session or authentication middleware
      const user = await storage.updateUserSurvey(
        userId,
        validatedData.currentRole,
        validatedData.targetRole,
        validatedData.preferences
      );
      res.json(user);
    } catch (error) {
      console.error("Survey validation error:", error); // Debug log
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid survey data" });
    }
  });

  app.post("/api/resume/analyze", async (req, res) => {
    try {
      console.log("Received resume data:", req.body); // Debug log
      const { resumeText } = z.object({ resumeText: z.string() }).parse(req.body);
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      const analysis = await analyzeResume(resumeText);
      const updatedUser = await storage.updateUserResumeAnalysis(userId, analysis);

      // Get skill gap analysis based on current role and target role
      const skillGap = await getSkillGapAnalysis(
        analysis.skills || [], 
        updatedUser.targetRole || ""
      );

      console.log("User current role:", updatedUser.currentRole);
      console.log("User target role:", updatedUser.targetRole);
      console.log("Skill gap analysis:", skillGap);

      res.json({ user: updatedUser, skillGap });
    } catch (error) {
      console.error("Resume analysis error:", error); // Debug log
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to analyze resume" });
    }
  });

  app.get("/api/courses/recommended", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      // Get courses based on both current skills and identified skill gaps
      const skillsToMatch = user.skills || [];
      const courses = await storage.getCoursesBySkills(skillsToMatch);

      console.log("Recommending courses based on skills:", skillsToMatch);
      console.log("Found courses:", courses);

      res.json(courses);
    } catch (error) {
      res.status(400).json({ error: "Failed to get course recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}