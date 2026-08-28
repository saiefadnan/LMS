import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in to submit quiz results.');

    const data = ctx.request.body?.data || {};

    try {
      const result = await strapi
        .service('api::quiz-result.quiz-result')
        .submitQuizResult(user.id, data);

      return { data: result };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to submit quiz result.');
    }
  },

  async find(ctx) {
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

    try {
      const results = await strapi
        .service('api::quiz-result.quiz-result')
        .getQuizResultsForUser(user.id, roleType);

      return { data: results, meta: {} };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to fetch quiz results.');
    }
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type ||
      'student';

    try {
      const result = await strapi
        .service('api::quiz-result.quiz-result')
        .getQuizResultById(user.id, roleType, id);

      if (!result) return ctx.notFound('Quiz result not found.');

      return { data: result };
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        return ctx.forbidden('Not authorized to view this result.');
      }
      return ctx.badRequest(err.message || 'Failed to fetch quiz result.');
    }
  },
}));
