import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::enrollment.enrollment', ({ strapi }) => ({
  /**
   * Enroll a student in a course with duplicate check and relation linking.
   */
  async enrollStudent(userId: number, courseId: string) {
    if (!courseId) {
      throw new Error('Course ID is required.');
    }

    // Check if course exists
    const isNumeric = /^\d+$/.test(String(courseId));
    const course = await strapi.db.query('api::course.course').findOne({
      where: isNumeric ? { id: Number(courseId) } : { documentId: String(courseId) },
    });

    if (!course) {
      throw new Error('Course not found.');
    }

    // Check if enrollment already exists
    const existing = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: { id: userId },
        course: { id: course.id },
      },
    });

    if (existing) {
      throw new Error('You are already enrolled in this course.');
    }

    // Create the enrollment document with relations
    const enrollment = await strapi.documents('api::enrollment.enrollment').create({
      data: {
        student: userId,
        course: course.id,
        enrolledAt: new Date().toISOString(),
      },
      populate: ['course', 'student'],
    });

    return enrollment;
  },

  /**
   * Fetch all enrollments for a specific student.
   */
  async getStudentEnrollments(userId: number) {
    return await strapi.db.query('api::enrollment.enrollment').findMany({
      where: {
        student: { id: userId },
      },
      populate: ['course', 'course.instructor', 'course.lessons', 'student'],
      orderBy: { createdAt: 'desc' },
    });
  },
}));
