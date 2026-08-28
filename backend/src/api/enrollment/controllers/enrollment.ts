import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to enroll.');
    }

    const data = ctx.request.body?.data || {};
    const courseId = data.course;

    try {
      const enrollment = await strapi
        .service('api::enrollment.enrollment')
        .enrollStudent(user.id, courseId);

      return { data: enrollment };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to enroll in course.');
    }
  },

  async findMyEnrollments(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const enrollments = await strapi
      .service('api::enrollment.enrollment')
      .getStudentEnrollments(user.id);

    ctx.body = { data: enrollments };
  },
}));
