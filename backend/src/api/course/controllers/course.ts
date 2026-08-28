import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course.');
    }

    const data = ctx.request.body?.data || {};

    try {
      const course = await strapi
        .service('api::course.course')
        .createCourse(user, data);

      return { data: course };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to create course.');
    }
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

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
        .service('api::course.course')
        .cascadeDeleteCourse(user, roleType, id);

      return { data: result };
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return ctx.notFound('Course not found.');
      }
      if (err.message === 'FORBIDDEN_COURSE_OWNER') {
        return ctx.forbidden('You can only delete your own courses.');
      }
      return ctx.internalServerError(err.message || 'Failed to delete course.');
    }
  },

  async findMyCourses(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

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
      const courses = await strapi
        .service('api::course.course')
        .getMyCourses(user, roleType);

      ctx.body = { data: courses };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to fetch courses.');
    }
  },

  async getCourseStudentProgress(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const { documentId } = ctx.params;
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
      const progressData = await strapi
        .service('api::course.course')
        .getCourseStudentProgress(user, roleType, documentId, ctx.query);

      ctx.body = progressData;
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return ctx.notFound('Course not found.');
      }
      if (err.message === 'FORBIDDEN_COURSE_OWNER') {
        return ctx.forbidden('You can only view student progress for your own courses.');
      }
      return ctx.badRequest(err.message || 'Failed to fetch student progress.');
    }
  },
}));
