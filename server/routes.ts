import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { analyzeResume, getSkillGapAnalysis } from "./openai";
import { surveySchema, insertUserSchema } from "@shared/schema";
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
      const user = await storage.updateUserSurvey(
        userId,
        validatedData.currentRole,
        validatedData.targetRole,
        validatedData.preferences
      );
      
      console.log("Updated user state:", user);

      if (!user.hasCompletedSurvey) {
        console.error("Survey completion flag not set after update");
      }

      res.json(user);
    } catch (error) {
      console.error("Survey validation/update error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid survey data" });
    }
  });

  app.post("/api/survey/complete", async (req, res) => {
    try {
      const userId = 1; // In a real app, get from session
      const user = await storage.completeUserSurvey(userId);
      res.json(user);
    } catch (error) {
      console.error("Error completing survey:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to complete survey" });
    }
  });

app.post("/api/resume/analyze", async (req, res) => {
  try {
    console.log("Received resume data:", req.body);
    const { resumeText } = z.object({ resumeText: z.string() }).parse(req.body);
    const userId = 1; // In a real app, get from session
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const analysis = await analyzeResume(resumeText);
    
    // Get skill gap analysis based on current role and target role
    const skillGap = await getSkillGapAnalysis(
      analysis.skills || [], 
      user.targetRole || "",
      { currentRole: user.currentRole || undefined }
    );

    console.log("User current role:", user.currentRole);
    console.log("User target role:", user.targetRole);
    console.log("Skill gap analysis:", skillGap);

    // Merge the skill gap analysis with the resume analysis
    const mergedAnalysis = {
      ...analysis,
      missingSkills: skillGap.missingSkills,
      recommendations: skillGap.recommendations,
      suggestedRoles: [
        "Senior Product Manager",
        "Director of Product",
        "Technical Product Manager",
        "Product Strategy Manager",
        "Engineering Manager"
      ]
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

    // Create a new analysis with suggested roles based on current role
    const mergedAnalysis = {
      skills: user.resumeAnalysis?.skills || [],
      experience: user.resumeAnalysis?.experience || [],
      education: user.resumeAnalysis?.education || [],
      missingSkills: user.resumeAnalysis?.missingSkills || [],
      recommendations: user.resumeAnalysis?.recommendations || [],
      suggestedRoles: [
        "Senior Product Manager",
        "Director of Product",
        "Technical Product Manager",
        "Product Strategy Manager",
        "Engineering Manager"
      ]
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

    // Get all available courses
    const courses = await storage.getCourses();

    // Get personalized recommendations
    const recommendations = await getRecommendedCourses(user, courses);
    
    console.log("Generated recommendations for user:", {
      userId,
      currentRole: user.currentRole,
      targetRole: user.targetRole,
      recommendationCount: recommendations.length
    });

    res.json(recommendations);
  } catch (error) {
    console.error("Failed to get course recommendations:", error);
    res.status(400).json({ error: "Failed to get course recommendations" });
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
        // Get skill gap analysis directly from OpenAI
        const skillGap = await getSkillGapAnalysis(
          currentSkills,
          user.targetRole,
          { currentRole: user.currentRole || undefined }
        );

        console.log("Generated skill gap analysis:", skillGap);

        // Update user with latest skill gap analysis
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
        // If skill gap analysis fails, ensure we have empty arrays
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
      
      // Ensure user has a resumeAnalysis with required fields
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