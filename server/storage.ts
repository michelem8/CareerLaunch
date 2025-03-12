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
    this.initializeDefaultUser();
    console.log("MemStorage initialized with courses:", this.courses.size);
    console.log("Default user created with ID:", 1);
  }

  private initializeDefaultUser() {
    console.log("Initializing default user");
    const defaultUser: User = {
      id: 1,
      username: "demo_user",
      password: "demo_password",
      currentRole: null,
      targetRole: null,
      skills: [],
      resumeAnalysis: null,
      preferences: null,
      hasCompletedSurvey: false,
      surveyStep: 1
    };
    this.users.set(1, defaultUser);
    this.currentId = 2; // Next ID will be 2
  }

  private initializeCourses() {
    console.log("Initializing courses...");
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "Advanced Project Management",
        description: "Master modern project management methodologies",
        platform: "Coursera",
        difficulty: "Intermediate",
        duration: "8 weeks",
        skills: ["project management", "leadership", "agile"],
        url: "https://example.com/course1",
        price: "$49.99",
        rating: 4.7
      },
      {
        id: 2,
        title: "Data Analysis Fundamentals",
        description: "Learn essential data analysis techniques",
        platform: "Udemy",
        difficulty: "Beginner",
        duration: "4 weeks",
        skills: ["data analysis", "statistics", "excel"],
        url: "https://example.com/course2",
        price: "$29.99",
        rating: 4.5
      },
      {
        id: 3,
        title: "Product Management Leadership",
        description: "Advanced strategies for product leadership",
        platform: "edX",
        difficulty: "Advanced",
        duration: "12 weeks",
        skills: ["product management", "leadership", "strategy"],
        url: "https://example.com/course3",
        price: "$99.99",
        rating: 4.9
      },
      {
        id: 4,
        title: "Technical Team Leadership",
        description: "Lead technical teams effectively",
        platform: "LinkedIn Learning",
        difficulty: "Intermediate",
        duration: "6 weeks",
        skills: ["leadership", "team management", "technical communication"],
        url: "https://example.com/course4",
        price: "$39.99",
        rating: 4.6
      },
    ];

    console.log("Sample courses created:", sampleCourses);
    sampleCourses.forEach(course => {
      console.log(`Adding course to storage: ${course.title}`);
      this.courses.set(Number(course.id), course);
    });
    console.log("Finished initializing courses. Total courses:", this.courses.size);
  }

  async getUser(id: number): Promise<User | undefined> {
    console.log("Getting user with id:", id);
    const user = this.users.get(id);
    console.log("Found user:", user ? JSON.stringify(user) : "undefined");
    
    // If user is still not found (edge case in serverless), create a default one
    if (!user && id === 1) {
      console.log("Creating default user on-demand");
      return this.createUser({
        username: "demo_user",
        password: "demo_password"
      });
    }
    
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