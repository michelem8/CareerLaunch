import { User, Course, InsertUser, ResumeAnalysis, UserPreferences } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSurvey(userId: number, currentRole: string, targetRole: string, preferences: UserPreferences): Promise<User>;
  updateUserResumeAnalysis(userId: number, analysis: ResumeAnalysis): Promise<User>;
  getCourses(): Promise<Course[]>;
  getCoursesBySkills(skills: string[]): Promise<Course[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.currentId = 1;
    this.initializeCourses();
  }

  private initializeCourses() {
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "Advanced Project Management",
        description: "Master modern project management methodologies",
        imageUrl: "https://images.unsplash.com/photo-1557804483-ef3ae78eca57",
        skills: ["project management", "leadership", "agile"],
        difficulty: "intermediate",
      },
      {
        id: 2,
        title: "Data Analysis Fundamentals",
        description: "Learn essential data analysis techniques",
        imageUrl: "https://images.unsplash.com/photo-1555421689-3f034debb7a6",
        skills: ["data analysis", "statistics", "excel"],
        difficulty: "beginner",
      },
      {
        id: 3,
        title: "Product Management Leadership",
        description: "Advanced strategies for product leadership",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
        skills: ["product management", "leadership", "strategy"],
        difficulty: "advanced",
      },
      {
        id: 4,
        title: "Technical Team Leadership",
        description: "Lead technical teams effectively",
        imageUrl: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28",
        skills: ["leadership", "team management", "technical communication"],
        difficulty: "intermediate",
      },
    ];

    sampleCourses.forEach(course => this.courses.set(course.id, course));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      currentRole: "",
      targetRole: "",
      skills: [],
      resumeAnalysis: null,
      preferences: null,
      hasCompletedSurvey: false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSurvey(
    userId: number,
    currentRole: string,
    targetRole: string,
    preferences: UserPreferences,
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updated: User = {
      ...user,
      currentRole,
      targetRole,
      preferences,
      hasCompletedSurvey: true,
    };
    this.users.set(userId, updated);
    return updated;
  }

  async updateUserResumeAnalysis(
    userId: number,
    analysis: ResumeAnalysis,
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updated: User = {
      ...user,
      resumeAnalysis: analysis,
      skills: analysis.skills,
    };
    this.users.set(userId, updated);
    return updated;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCoursesBySkills(skills: string[]): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course =>
      course.skills.some(skill =>
        skills.some(userSkill =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      )
    );
  }
}

export const storage = new MemStorage();