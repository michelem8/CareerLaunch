import { User, Course, InsertUser, ResumeAnalysis, UserPreferences } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSurvey(userId: number, currentRole: string, targetRole: string, preferences: UserPreferences): Promise<User>;
  updateUserResumeAnalysis(userId: number, analysis: ResumeAnalysis): Promise<User>;
  updateUserRoles(userId: number, currentRole: string, targetRole: string): Promise<User>;
  getCourses(): Promise<Course[]>;
  getCoursesBySkills(skills: string[]): Promise<Course[]>;
  completeUserSurvey(userId: number): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private currentId: number;

  constructor() {
    console.log("Initializing MemStorage");
    this.users = new Map();
    this.courses = new Map();
    this.currentId = 1;
    this.initializeCourses();
    console.log("MemStorage initialized with courses:", this.courses.size);
  }

  private initializeCourses() {
    console.log("Initializing courses...");
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "Advanced Project Management",
        description: "Master modern project management methodologies",
        imageUrl: "https://images.unsplash.com/photo-1557804483-ef3ae78eca57",
        skills: ["project management", "leadership", "agile"],
        difficulty: "intermediate",
        industry: "enterprise-software",
        learningStyle: "practical",
        timeCommitment: "4-8",
        level: "intermediate"
      },
      {
        id: 2,
        title: "Data Analysis Fundamentals",
        description: "Learn essential data analysis techniques",
        imageUrl: "https://images.unsplash.com/photo-1555421689-3f034debb7a6",
        skills: ["data analysis", "statistics", "excel"],
        difficulty: "beginner",
        industry: "data-analytics",
        learningStyle: "hands-on",
        timeCommitment: "2-4",
        level: "beginner"
      },
      {
        id: 3,
        title: "Product Management Leadership",
        description: "Advanced strategies for product leadership",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
        skills: ["product management", "leadership", "strategy"],
        difficulty: "advanced",
        industry: "product-management",
        learningStyle: "project_based",
        timeCommitment: "4-8",
        level: "advanced"
      },
      {
        id: 4,
        title: "Technical Team Leadership",
        description: "Lead technical teams effectively",
        imageUrl: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28",
        skills: ["leadership", "team management", "technical communication"],
        difficulty: "intermediate",
        industry: "enterprise-software",
        learningStyle: "interactive",
        timeCommitment: "4-8",
        level: "intermediate"
      },
    ];

    console.log("Sample courses created:", sampleCourses);
    sampleCourses.forEach(course => {
      console.log(`Adding course to storage: ${course.title}`);
      this.courses.set(course.id, course);
    });
    console.log("Finished initializing courses. Total courses:", this.courses.size);
  }

  async getUser(id: number): Promise<User | undefined> {
    console.log("Getting user with id:", id);
    const user = this.users.get(id);
    console.log("Found user:", user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log("Getting user by username:", username);
    const user = Array.from(this.users.values()).find(u => u.username === username);
    console.log("Found user:", user);
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    console.log("Creating new user with data:", userData);
    const user: User = {
      ...userData,
      id: this.currentId++,
      currentRole: null,
      targetRole: null,
      skills: [],
      resumeAnalysis: null,
      preferences: null,
      hasCompletedSurvey: false,
      surveyStep: 1
    };
    console.log("Initialized new user state:", user);
    this.users.set(user.id, user);
    return user;
  }

  async updateUserSurvey(
    userId: number,
    currentRole: string,
    targetRole: string,
    preferences: UserPreferences,
  ): Promise<User> {
    console.log("Updating user survey data:", { userId, currentRole, targetRole, preferences });
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updated: User = {
      ...user,
      currentRole,
      targetRole,
      preferences,
      surveyStep: 3,
    };
    this.users.set(userId, updated);
    console.log("Updated user state after survey:", updated);
    return updated;
  }

  async updateUserResumeAnalysis(
    userId: number,
    analysis: ResumeAnalysis,
  ): Promise<User> {
    console.log("Updating user resume analysis:", { userId, analysis });
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Ensure all required fields are present
    const mergedAnalysis: ResumeAnalysis = {
      skills: analysis.skills || [],
      experience: analysis.experience || [],
      education: analysis.education || [],
      suggestedRoles: analysis.suggestedRoles || [],
      missingSkills: analysis.missingSkills || [],
      recommendations: analysis.recommendations || []
    };

    const updated: User = {
      ...user,
      resumeAnalysis: mergedAnalysis,
      skills: mergedAnalysis.skills,
      surveyStep: 3,
      hasCompletedSurvey: true,
    };
    this.users.set(userId, updated);
    console.log("Updated user state after resume analysis:", updated);
    return updated;
  }

  async updateUserRoles(
    userId: number,
    currentRole: string,
    targetRole: string,
  ): Promise<User> {
    console.log("Updating user roles:", { userId, currentRole, targetRole });
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updated: User = {
      ...user,
      currentRole,
      targetRole,
      surveyStep: 2,
    };
    this.users.set(userId, updated);
    console.log("Updated user state after roles update:", updated);
    return updated;
  }

  async completeUserSurvey(userId: number): Promise<User> {
    console.log("Completing user survey:", userId);
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updated: User = {
      ...user,
      hasCompletedSurvey: true,
      surveyStep: 3,
      // Preserve the existing resume analysis
      resumeAnalysis: user.resumeAnalysis || {
        skills: [],
        experience: [],
        education: [],
        suggestedRoles: [],
        missingSkills: [],
        recommendations: []
      }
    };
    this.users.set(userId, updated);
    console.log("Updated user state after survey completion:", updated);
    return updated;
  }

  async getCourses(): Promise<Course[]> {
    console.log("Getting all courses...");
    const courses = Array.from(this.courses.values());
    console.log("Retrieved courses:", courses);
    return courses;
  }

  async getCoursesBySkills(skills: string[]): Promise<Course[]> {
    console.log("Getting courses by skills:", skills);
    const courses = Array.from(this.courses.values()).filter(course =>
      course.skills.some(skill =>
        skills.some(userSkill =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      )
    );
    console.log("Found courses matching skills:", courses);
    return courses;
  }
}

export const storage = new MemStorage();