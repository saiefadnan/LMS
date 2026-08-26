/**
 * course controller
 * 
 * Extends the default Strapi controller.
 * Auto-sets the instructor relation to the authenticated user on create.
 * 
 * In Strapi v5, relation fields (like `instructor`) cannot be passed through
 * the Content API body or query filters — they are rejected by the strict
 * parameter validator. Instead we handle relations server-side.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course.');
    }

    // Remove instructor from body if frontend sent it (Strapi v5 rejects relation keys)
    if (ctx.request.body?.data?.instructor) {
      delete ctx.request.body.data.instructor;
    }

    // Let default Strapi controller handle the create
    const response = await super.create(ctx);

    // Now set the instructor relation via the Document Service (server-side)
    if (response?.data?.documentId) {
      await strapi.documents('api::course.course').update({
        documentId: response.data.documentId,
        data: {
          instructor: user.id,
        },
      });
    }

    return response;
  },

  /**
   * Custom action: returns courses belonging to the authenticated instructor.
   * Strapi v5 blocks filtering by relation fields in the Content API,
   * so we query the database directly.
   */
  async findMyCourses(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const courses = await strapi.db.query('api::course.course').findMany({
      where: {
        instructor: { id: user.id },
      },
      populate: ['instructor', 'lessons', 'enrollments'],
      orderBy: { createdAt: 'desc' },
    });

    ctx.body = { data: courses };
  },
}));

