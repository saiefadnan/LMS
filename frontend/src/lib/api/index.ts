/**
 * Barrel export — import any API function from '@/lib/api'
 * 
 * Usage:
 *   import { loginUser, getCourses } from '@/lib/api';
 * 
 * This keeps imports clean while the actual code is split
 * into domain-specific modules underneath.
 */
export { fetchAPI } from './client';
export { loginUser, registerUser, getMe, logout } from './auth';
export { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from './courses';
export { getLessons, getLesson, createLesson, updateLesson, deleteLesson } from './lessons';
export { enrollInCourse, getMyEnrollments } from './enrollments';
export { markLessonComplete, getMyProgress } from './progress';
export { getQuiz, submitQuizResult } from './quizzes';
export { getBlogPosts, getBlogPost, createBlogPost, updateBlogPost } from './blog';
export { getAllUsers, updateUserRole } from './admin';
