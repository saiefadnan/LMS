import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor']),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a detailed description'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(2, 'Category is required'),
  published: z.boolean(),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});
export type CourseFormValues = z.infer<typeof courseSchema>;

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content is required'),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  order: z.number().int().min(1),
});
export type LessonFormValues = z.infer<typeof lessonSchema>;
