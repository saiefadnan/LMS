import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in to record progress.');

    const data = ctx.request.body?.data || {};
    const lessonId = data.lesson;

    try {
      const progress = await strapi
        .service('api::progress.progress')
        .recordLessonProgress(user.id, lessonId);

      return { data: progress };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to record progress.');
    }
  },

  async findMyProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { courseDocumentId } = ctx.params;

    try {
      const progresses = await strapi
        .service('api::progress.progress')
        .getStudentCourseProgress(user.id, courseDocumentId);

      ctx.body = { data: progresses };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to fetch course progress.');
    }
  },
}));
