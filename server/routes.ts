import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeResume, getSkillGapAnalysis } from "./openai";
import { surveySchema, insertUserSchema, rolesSchema } from "@shared/schema";
import { getRecommendedCourses } from "./recommendations";
import skillsRoutes from './features/skills/routes';
import { z } from "zod";
import { openai } from "./openai-client";

export async function registerRoutes(app: Express) {
  // Register skills routes with /api prefix
  app.use('/api/skills', skillsRoutes);

  app.post("/api/users", async (req, res) => {
    try {
      console.log("Received user creation request:", req.body);
      const userData = insertUserSchema.parse(req.body);
      console.log("Validated user data:", userData);
      
      const user = await storage.createUser(userData);
      console.log("Created user successfully:", user);
      
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid user data" });
    }
  });

  app.post("/api/survey", async (req, res) => {
    try {
      console.log("Received survey data:", req.body);
      const validatedData = surveySchema.parse(req.body);
      const userId = 1; // In a real app, get from session or authentication middleware

      // Get current user data
      let currentUser = await storage.getUser(userId);
      console.log("Current user state:", currentUser);

      // If no user exists, create one
      if (!currentUser) {
        console.log("No user found, creating default user");
        currentUser = await storage.createUser({
          username: "demo_user",
          password: "demo_password"
        });
        console.log("Created default user:", currentUser);
      }

      // Update user with survey data
      const updatedUser = await storage.updateUserSurvey(
        userId,
        validatedData.currentRole,
        validatedData.targetRole,
        validatedData.preferences
      );
      
      console.log("Updated user state:", updatedUser);

      // Complete the survey
      const finalUser = await storage.completeUserSurvey(userId);
      console.log("Completed survey, final user state:", finalUser);

      res.json(finalUser);
    } catch (error) {
      console.error("Survey validation/update error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid survey data" });
    }
  });

  app.post("/api/survey/complete", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      // Create a new analysis with existing data
      const mergedAnalysis = {
        skills: user.resumeAnalysis?.skills || [],
        experience: user.resumeAnalysis?.experience || [],
        education: user.resumeAnalysis?.education || [],
        missingSkills: user.resumeAnalysis?.missingSkills || [],
        recommendations: user.resumeAnalysis?.recommendations || [],
        suggestedRoles: user.resumeAnalysis?.suggestedRoles || []
      };

      // First update the resume analysis
      const updatedUser = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
      
      // Then complete the survey
      const finalUser = await storage.completeUserSurvey(userId);
      res.json(finalUser);
    } catch (error) {
      console.error("Error completing survey:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to complete survey" });
    }
  });

  app.post("/api/survey/roles", async (req, res) => {
    try {
      console.log("Received roles data:", req.body);
      const { currentRole, targetRole } = rolesSchema.parse(req.body);

      const userId = 1; // In a real app, get from session

      // Get current user data
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: "demo_user",
          password: "demo_password"
        });
      }

      // Update just the roles
      const updated = await storage.updateUserRoles(userId, currentRole, targetRole);
      console.log("Updated user with roles:", updated);
      
      // Ensure we're sending a valid JSON response
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Roles update error:", error);
      
      // Make sure we're sending a complete, valid JSON response
      return res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to save roles",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.post("/api/resume/analyze", async (req, res) => {
    try {
      console.log("Received resume data:", req.body);
      const { resumeText, currentRole, targetRole } = z.object({ 
        resumeText: z.string(),
        currentRole: z.string().optional(),
        targetRole: z.string().optional()
      }).parse(req.body);
      
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      const analysis = await analyzeResume(resumeText);
      
      // Get skill gap analysis based on current role and target role (from the request if provided)
      const skillGap = await getSkillGapAnalysis(
        analysis.skills || [], 
        targetRole || user.targetRole || "",
        { currentRole: currentRole || user.currentRole || undefined }
      );

      console.log("Using roles for analysis:", { 
        currentRole: currentRole || user.currentRole, 
        targetRole: targetRole || user.targetRole 
      });
      console.log("Skill gap analysis:", skillGap);

      // Merge the skill gap analysis with the resume analysis
      const mergedAnalysis = {
        ...analysis,
        missingSkills: skillGap.missingSkills,
        recommendations: skillGap.recommendations
      };

      const updatedUser = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);

      res.json({ user: updatedUser, skillGap });
    } catch (error) {
      console.error("Resume analysis error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to analyze resume" });
    }
  });

  // Add endpoint to update suggested roles
  app.post("/api/user/update-suggested-roles", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      // Create a new analysis with existing data
      const mergedAnalysis = {
        skills: user.resumeAnalysis?.skills || [],
        experience: user.resumeAnalysis?.experience || [],
        education: user.resumeAnalysis?.education || [],
        missingSkills: user.resumeAnalysis?.missingSkills || [],
        recommendations: user.resumeAnalysis?.recommendations || [],
        suggestedRoles: user.resumeAnalysis?.suggestedRoles || []
      };

      const updatedUser = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating suggested roles:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update suggested roles" });
    }
  });

  app.get("/api/courses/recommended", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const user = await storage.getUser(userId);
      if (!user) throw new Error("User not found");

      // Get skills from query parameters and ensure they are strings
      const requestedSkills = req.query.skills;
      const missingSkills: string[] = Array.isArray(requestedSkills)
        ? requestedSkills.map(skill => String(skill))
        : requestedSkills
          ? [String(requestedSkills)]
          : [];

      // Update user's missing skills for this request
      if (user.resumeAnalysis) {
        user.resumeAnalysis.missingSkills = missingSkills;
      } else {
        user.resumeAnalysis = {
          skills: user.skills || [],
          experience: [],
          education: [],
          missingSkills,
          recommendations: [],
          suggestedRoles: []
        };
      }

      // Get personalized recommendations using OpenAI
      const recommendations = await getRecommendedCourses(user);
      
      console.log("Generated recommendations for user:", {
        userId,
        currentRole: user.currentRole,
        targetRole: user.targetRole,
        requestedSkills: missingSkills,
        recommendationCount: recommendations.length
      });

      res.json(recommendations);
    } catch (error) {
      console.error("Failed to get course recommendations:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get course recommendations",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  app.get("/api/users/me", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      let user = await storage.getUser(userId);
      
      console.log("Current user state:", user);

      // If no user exists, create a default one
      if (!user) {
        console.log("No user found, creating default user");
        user = await storage.createUser({
          username: "demo_user",
          password: "demo_password"
        });
        console.log("Created default user:", user);
      }

      // If user has completed survey and has a target role, update skill gap analysis
      if (user.hasCompletedSurvey && user.targetRole) {
        console.log("Updating skill gap analysis for user with target role:", user.targetRole);
        
        const currentSkills = [
          ...(user.skills || []),
          ...(user.resumeAnalysis?.skills || [])
        ];

        console.log("Current skills for analysis:", currentSkills);

        try {
          const skillGap = await getSkillGapAnalysis(
            currentSkills,
            user.targetRole,
            { currentRole: user.currentRole || undefined }
          );

          console.log("Generated skill gap analysis:", skillGap);

          const mergedAnalysis = {
            skills: user.resumeAnalysis?.skills || [],
            experience: user.resumeAnalysis?.experience || [],
            education: user.resumeAnalysis?.education || [],
            suggestedRoles: user.resumeAnalysis?.suggestedRoles || [],
            missingSkills: skillGap.missingSkills,
            recommendations: skillGap.recommendations
          };

          console.log("Merged analysis:", mergedAnalysis);
          user = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
          console.log("Updated user with merged analysis:", user);
        } catch (error) {
          console.error("Error generating skill gap analysis:", error);
          if (!user.resumeAnalysis?.missingSkills || !user.resumeAnalysis?.recommendations) {
            const mergedAnalysis = {
              skills: user.resumeAnalysis?.skills || [],
              experience: user.resumeAnalysis?.experience || [],
              education: user.resumeAnalysis?.education || [],
              suggestedRoles: user.resumeAnalysis?.suggestedRoles || [],
              missingSkills: [],
              recommendations: []
            };
            user = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
          }
        }
      } else {
        console.log("Skipping skill gap analysis - user has not completed survey or has no target role");
        console.log("hasCompletedSurvey:", user.hasCompletedSurvey);
        console.log("targetRole:", user.targetRole);
        
        if (!user.resumeAnalysis?.missingSkills || !user.resumeAnalysis?.recommendations) {
          const mergedAnalysis = {
            skills: user.resumeAnalysis?.skills || [],
            experience: user.resumeAnalysis?.experience || [],
            education: user.resumeAnalysis?.education || [],
            suggestedRoles: user.resumeAnalysis?.suggestedRoles || [],
            missingSkills: [],
            recommendations: []
          };
          user = await storage.updateUserResumeAnalysis(userId, mergedAnalysis);
        }
      }

      res.json(user);
    } catch (error) {
      console.error("Failed to get/create user data:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get user data",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/test/openai", async (req, res) => {
    try {
      console.log("Testing OpenAI API key...");
      console.log("API Key present:", process.env.OPENAI_API_KEY ? "Yes" : "No");
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Say hello"
          }
        ]
      });

      console.log("OpenAI test response:", response);
      res.json({ success: true, message: "OpenAI API key is working" });
    } catch (error) {
      console.error("OpenAI test error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to test OpenAI API key" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}