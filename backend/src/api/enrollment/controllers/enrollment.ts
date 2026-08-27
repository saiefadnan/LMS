import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to enroll.');
    }

    // Extract the data from the request body
    const data = ctx.request.body?.data || {};
    const courseId = data.course;

    if (!courseId) {
      return ctx.badRequest('Course ID is required.');
    }

    // Check if enrollment already exists
    const existingEnrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: {
        student: { id: user.id },
        course: { documentId: courseId },
      },
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      return ctx.badRequest('You are already enrolled in this course.');
    }

    // Remove relation fields from body (Strapi v5 rejects them in Content API)
    delete ctx.request.body.data.student;
    delete ctx.request.body.data.course;

    // Add non-relation fields
    ctx.request.body.data = {
      ...ctx.request.body.data,
      enrolledAt: new Date().toISOString(),
    };

    // Call the default core create action
    const response = await super.create(ctx);

    // Set relation fields via Document Service (server-side)
    if (response?.data?.documentId) {
      await strapi.documents('api::enrollment.enrollment').update({
        documentId: response.data.documentId,
        data: {
          student: user.id,
          course: courseId,
        },
      });
    }

    return response;
  },

  /**
   * Custom action: returns enrollments for the authenticated student.
   */
  async findMyEnrollments(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: {
        student: { id: user.id },
      },
      populate: ['course', 'course.instructor', 'course.lessons', 'student'],
      orderBy: { createdAt: 'desc' },
    });

    ctx.body = { data: enrollments };
  },
}));

