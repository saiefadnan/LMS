import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::progress.progress', ({ strapi }) => ({
  /**
   * Record that a student completed a lesson, preventing duplicate records.
   */
  async recordLessonProgress(userId: number, lessonId: number) {
    if (!lessonId) {
      throw new Error('Lesson ID is required.');
    }

    // Check if progress already exists
    const existingProgress = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: { id: userId },
        lesson: { id: lessonId },
      },
    });

    if (existingProgress) {
      throw new Error('Progress already exists for this lesson.');
    }

    // Create progress document with relations
    const progress = await strapi.documents('api::progress.progress').create({
      data: {
        student: userId,
        lesson: lessonId,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      populate: ['lesson', 'student'],
    });

    return progress;
  },

  /**
   * Fetch all lesson completion progress records for a student within a specific course.
   */
  async getStudentCourseProgress(userId: number, courseDocumentId: string) {
    if (!courseDocumentId) {
      throw new Error('Course documentId is required.');
    }

    return await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: { id: userId },
        lesson: {
          course: { documentId: courseDocumentId },
        },
      },
      populate: ['lesson'],
    });
  },
}));
