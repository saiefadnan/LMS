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
    const existingEnrollments = await strapi.documents('api::enrollment.enrollment').findMany({
      filters: {
        student: user.id,
        course: courseId,
      },
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      return ctx.badRequest('You are already enrolled in this course.');
    }

    // Force the student field to be the authenticated user
    // Ignore any student ID they might have maliciously sent
    ctx.request.body.data = {
      ...data,
      student: user.id,
      enrolledAt: new Date().toISOString(),
    };

    // Call the default core create action
    const response = await super.create(ctx);
    return response;
  },
}));
