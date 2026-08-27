/**
 * Type definitions for our LMS domain models.
 * 
 * These mirror the Strapi content types exactly.
 * Having them here means every component that uses data
 * gets autocomplete and type-checking for free.
 */

// ─── Auth ───────────────────────────────────────────────────────

export interface UserRole {
  id: number;
  name: string;
  type: 'admin' | 'content_manager' | 'instructor' | 'student';
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

// ─── Course ─────────────────────────────────────────────────────

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string | StrapiMedia;
  instructor?: User;
  lessons?: Lesson[];
  quizzes?: Quiz[];
  enrollments?: Enrollment[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseInput {
  title?: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  thumbnail?: string | StrapiMedia;
  instructor?: number | string | User;
  quizzes?: Quiz[];
  published?: boolean;
}

// ─── Lesson ─────────────────────────────────────────────────────

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface LessonInput {
  title?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
  course?: number | string | Course;
}

// ─── Enrollment ─────────────────────────────────────────────────

export interface Enrollment {
  id: number;
  documentId: string;
  student?: User;
  course?: Course;
  enrolledAt: string;
  createdAt: string;
}

// ─── Progress ───────────────────────────────────────────────────

export interface Progress {
  id: number;
  documentId: string;
  student?: User;
  lesson?: Lesson;
  course?: Course;
  completed: boolean;
  createdAt: string;
}

// ─── Quiz ───────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: number;
  documentId: string;
  title: string;
  questions: QuizQuestion[];
  course?: Course;
  createdAt: string;
}

export interface QuizInput {
  title: string;
  questions: QuizQuestion[];
  course?: string | number | Course;
}

// ─── Quiz Result ────────────────────────────────────────────────

export interface QuizResult {
  id: number;
  documentId: string;
  student?: User;
  quiz?: Quiz;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>;
  passed: boolean;
  createdAt: string;
}

// ─── Blog Post ──────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  body: string;
  content?: string;
  coverImage?: string | StrapiMedia;
  author?: User;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  body: string;
  coverImage?: string;
  status?: 'draft' | 'published';
}

// ─── Strapi Utilities ───────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: StrapiPagination;
  };
}
