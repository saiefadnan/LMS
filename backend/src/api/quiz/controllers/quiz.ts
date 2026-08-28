import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const data = ctx.request.body?.data || {};
    const courseId = data.course;
    
    if (!courseId) return ctx.badRequest('course ID is required');

    const isNumeric = /^\d+$/.test(String(courseId));
    const course = await strapi.db.query('api::course.course').findOne({
      where: isNumeric ? { id: Number(courseId) } : { documentId: String(courseId) },
      populate: ['instructor'],
    });

    if (!course) return ctx.notFound('Course not found');

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    // Admin and Content Manager can create a quiz for any course
    if (roleType !== 'admin' && roleType !== 'content_manager') {
      // Instructor must own the course
      if (course.instructor?.id !== user.id) {
        return ctx.forbidden('You can only create quizzes for your own courses');
      }
    }

    delete ctx.request.body.data.course; // Remove relation before creation
    const response = await super.create(ctx);

    if (response?.data?.documentId) {
      await strapi.documents('api::quiz.quiz').update({
        documentId: response.data.documentId,
        data: { course: course.id },
      });
    }

    return response;
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    if (roleType !== 'admin' && roleType !== 'content_manager') {
      const { id } = ctx.params;
      const isNumeric = /^\d+$/.test(String(id));
      const quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: isNumeric ? { id: Number(id) } : { documentId: String(id) },
        populate: { course: { populate: ['instructor'] } },
      });

      if (!quiz) return ctx.notFound('Quiz not found');
      if (quiz.course?.instructor?.id !== user.id) {
        return ctx.forbidden('You can only edit quizzes for your own courses');
      }
    }

    // Don't allow changing the course after creation
    if (ctx.request.body?.data?.course) {
      delete ctx.request.body.data.course;
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    if (roleType !== 'admin' && roleType !== 'content_manager') {
      const { id } = ctx.params;
      const isNumeric = /^\d+$/.test(String(id));
      const quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: isNumeric ? { id: Number(id) } : { documentId: String(id) },
        populate: { course: { populate: ['instructor'] } },
      });

      if (!quiz) return ctx.notFound('Quiz not found');
      if (quiz.course?.instructor?.id !== user.id) {
        return ctx.forbidden('You can only delete quizzes for your own courses');
      }
    }

    return super.delete(ctx);
  }
}));
