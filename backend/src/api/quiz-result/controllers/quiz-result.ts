import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-result.quiz-result', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const data = ctx.request.body?.data || {};
    const quizId = data.quiz;
    
    if (!quizId) return ctx.badRequest('quiz ID is required');

    // Auto-set the student relation to the logged-in user
    delete ctx.request.body.data.student;
    delete ctx.request.body.data.quiz;

    const response = await super.create(ctx);

    if (response?.data?.documentId) {
      await strapi.documents('api::quiz-result.quiz-result').update({
        documentId: response.data.documentId,
        data: { 
          student: user.id,
          quiz: quizId
        },
      });
    }

    return response;
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // If Admin or Content Manager, return all results
    if (user.role?.type === 'admin' || user.role?.type === 'content_manager') {
      return super.find(ctx);
    }

    // If Instructor, they can only see results for quizzes belonging to THEIR courses
    if (user.role?.type === 'instructor') {
      ctx.query.filters = {
        ...(ctx.query.filters || {}),
        quiz: {
          course: {
            instructor: { id: user.id }
          }
        }
      };
      return super.find(ctx);
    }

    // If Student, they can only see their OWN quiz results
    ctx.query.filters = {
      ...(ctx.query.filters || {}),
      student: { id: user.id }
    };
    return super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const result = await strapi.db.query('api::quiz-result.quiz-result').findOne({
      where: { documentId: id },
      populate: { quiz: { populate: { course: { populate: ['instructor'] } } }, student: true }
    });

    if (!result) return ctx.notFound();

    if (user.role?.type === 'admin' || user.role?.type === 'content_manager') {
      return super.findOne(ctx);
    }

    if (user.role?.type === 'instructor') {
      if (result.quiz?.course?.instructor?.id !== user.id) {
        return ctx.forbidden('Not authorized to view this result');
      }
      return super.findOne(ctx);
    }

    if (result.student?.id !== user.id) {
      return ctx.forbidden('Not authorized to view this result');
    }

    return super.findOne(ctx);
  }
}));
