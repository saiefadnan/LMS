import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in to create a quiz.');

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type ||
      'student';

    const data = ctx.request.body?.data || {};

    try {
      const quiz = await strapi
        .service('api::quiz.quiz')
        .createCourseQuiz(user, roleType, data);

      return { data: quiz };
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_COURSE_OWNER') {
        return ctx.forbidden('You can only create quizzes for your own courses.');
      }
      return ctx.badRequest(err.message || 'Failed to create quiz.');
    }
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
      )?.role?.type ||
      'student';

    const { id } = ctx.params;
    const data = ctx.request.body?.data || {};

    try {
      const quiz = await strapi
        .service('api::quiz.quiz')
        .updateCourseQuiz(user, roleType, id, data);

      return { data: quiz };
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return ctx.notFound('Quiz not found.');
      }
      if (err.message === 'FORBIDDEN_COURSE_OWNER') {
        return ctx.forbidden('You can only edit quizzes for your own courses.');
      }
      return ctx.badRequest(err.message || 'Failed to update quiz.');
    }
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
      )?.role?.type ||
      'student';

    const { id } = ctx.params;

    try {
      const result = await strapi
        .service('api::quiz.quiz')
        .deleteCourseQuiz(user, roleType, id);

      return { data: result };
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return ctx.notFound('Quiz not found.');
      }
      if (err.message === 'FORBIDDEN_COURSE_OWNER') {
        return ctx.forbidden('You can only delete quizzes for your own courses.');
      }
      return ctx.badRequest(err.message || 'Failed to delete quiz.');
    }
  },
}));
