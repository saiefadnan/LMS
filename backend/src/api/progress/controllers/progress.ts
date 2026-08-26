import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const data = ctx.request.body?.data || {};
    const lessonId = data.lesson;

    if (!lessonId) return ctx.badRequest('Lesson ID is required');

    // Check if progress already exists
    const existingProgress = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: { id: user.id },
        lesson: { id: lessonId },
      },
    });

    if (existingProgress) {
      return ctx.badRequest('Progress already exists for this lesson');
    }

    // Strip relations from body
    delete ctx.request.body.data.student;
    delete ctx.request.body.data.lesson;

    ctx.request.body.data = {
      ...ctx.request.body.data,
      completedAt: new Date().toISOString(),
    };

    const response = await super.create(ctx);

    // Set relations
    if (response?.data?.documentId) {
      await strapi.documents('api::progress.progress').update({
        documentId: response.data.documentId,
        data: {
          student: user.id,
          lesson: lessonId,
        },
      });
    }

    return response;
  },

  async findMyProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { courseDocumentId } = ctx.params;
    if (!courseDocumentId) return ctx.badRequest('courseDocumentId is required');

    // In v5 Document Service, we must query by relations properly
    const progresses = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: { id: user.id },
        lesson: {
          course: { documentId: courseDocumentId }
        }
      },
      populate: ['lesson'],
    });

    ctx.body = { data: progresses };
  }
}));

