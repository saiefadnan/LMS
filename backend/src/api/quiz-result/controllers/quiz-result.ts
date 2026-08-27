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

    const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role']
    });
    const roleType = userWithRole?.role?.type || 'student';

    let filters: any = {};

    if (roleType === 'admin' || roleType === 'content_manager') {
      // Global managers can see all results
      filters = {};
    } else if (roleType === 'instructor') {
      filters = {
        quiz: {
          course: {
            instructor: { id: user.id }
          }
        }
      };
    } else {
      // Student only sees their own results
      filters = {
        student: { id: user.id }
      };
    }

    const results = await strapi.documents('api::quiz-result.quiz-result').findMany({
      filters,
      populate: {
        quiz: {
          populate: {
            course: true
          }
        },
        student: {
          fields: ['id', 'username', 'email']
        }
      },
      sort: 'createdAt:desc'
    });

    return { data: results, meta: {} };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id } = ctx.params;
    const result = await strapi.documents('api::quiz-result.quiz-result').findOne({
      documentId: id,
      populate: {
        quiz: {
          populate: {
            course: {
              populate: ['instructor']
            }
          }
        },
        student: {
          fields: ['id', 'username', 'email']
        }
      }
    });

    if (!result) return ctx.notFound();

    const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role']
    });
    const roleType = userWithRole?.role?.type || 'student';

    if (roleType === 'admin' || roleType === 'content_manager') {
      return { data: result };
    }

    if (roleType === 'instructor') {
      if ((result.quiz as any)?.course?.instructor?.id !== user.id) {
        return ctx.forbidden('Not authorized to view this result');
      }
      return { data: result };
    }

    if ((result.student as any)?.id !== user.id) {
      return ctx.forbidden('Not authorized to view this result');
    }

    return { data: result };
  }
}));
