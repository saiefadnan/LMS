/**
 * Centralized API Endpoints Configuration
 * Single source of truth for all backend API routes.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/local',
    REGISTER: '/api/auth/local/register',
    ME: '/api/users/me',
  },
  COURSES: {
    ROOT: '/api/courses',
    MY_COURSES: '/api/courses/me',
    DETAIL: (documentId: string) => `/api/courses/${documentId}`,
    STUDENT_PROGRESS: (documentId: string) => `/api/courses/${documentId}/student-progress`,
  },
  ENROLLMENTS: {
    ROOT: '/api/enrollments',
    MY: '/api/enrollments/my',
    DETAIL: (documentId: string) => `/api/enrollments/${documentId}`,
  },
  LESSONS: {
    ROOT: '/api/lessons',
    DETAIL: (documentId: string) => `/api/lessons/${documentId}`,
  },
  PROGRESS: {
    ROOT: '/api/progresses',
    MY_COURSE: (courseDocId: string) => `/api/progresses/my/${courseDocId}`,
  },
  QUIZZES: {
    ROOT: '/api/quizzes',
    DETAIL: (documentId: string) => `/api/quizzes/${documentId}`,
  },
  QUIZ_RESULTS: {
    ROOT: '/api/quiz-results',
    DETAIL: (documentId: string) => `/api/quiz-results/${documentId}`,
  },
  BLOG: {
    ROOT: '/api/blog-posts',
    DETAIL: (documentId: string) => `/api/blog-posts/${documentId}`,
  },
  ADMIN: {
    USERS: '/api/users',
    USER_DETAIL: (userId: number | string) => `/api/users/${userId}`,
    ROLES: '/api/users-permissions/roles',
  },
} as const;
