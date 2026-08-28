import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a blog post.');
    }

    const roleType =
      user.role?.type ||
      (
        await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: user.id },
          populate: ['role'],
        })
      )?.role?.type;

    if (roleType !== 'admin' && roleType !== 'content_manager') {
      return ctx.forbidden('Only Content Managers and Admins can create blog posts.');
    }

    const data = ctx.request.body?.data || {};

    try {
      const post = await strapi
        .service('api::blog-post.blog-post')
        .createBlogPost(user, data);

      return { data: post };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to create blog post.');
    }
  },

  async find(ctx) {
    const user = ctx.state.user;
    const roleType =
      user?.role?.type ||
      (user
        ? (
            await strapi.db.query('plugin::users-permissions.user').findOne({
              where: { id: user.id },
              populate: ['role'],
            })
          )?.role?.type
        : null);

    const isEditor = roleType === 'admin' || roleType === 'content_manager';

    try {
      const posts = await strapi
        .service('api::blog-post.blog-post')
        .findBlogPosts(isEditor, ctx.query);

      return { data: posts };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to fetch blog posts.');
    }
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const roleType =
      user?.role?.type ||
      (user
        ? (
            await strapi.db.query('plugin::users-permissions.user').findOne({
              where: { id: user.id },
              populate: ['role'],
            })
          )?.role?.type
        : null);

    const isEditor = roleType === 'admin' || roleType === 'content_manager';
    const { id } = ctx.params;

    try {
      const post = await strapi
        .service('api::blog-post.blog-post')
        .findOneBlogPost(isEditor, id);

      if (!post) {
        return ctx.notFound('Blog post not found.');
      }

      return { data: post };
    } catch (err: any) {
      return ctx.badRequest(err.message || 'Failed to fetch blog post.');
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
      )?.role?.type;

    if (roleType !== 'admin' && roleType !== 'content_manager') {
      return ctx.forbidden('Only Content Managers and Admins can edit blog posts.');
    }

    const { id } = ctx.params;
    const data = ctx.request.body?.data || {};

    try {
      const post = await strapi
        .service('api::blog-post.blog-post')
        .updateBlogPost(id, data);

      return { data: post };
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return ctx.notFound('Blog post not found.');
      }
      return ctx.badRequest(err.message || 'Failed to update blog post.');
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
      )?.role?.type;

    if (roleType !== 'admin' && roleType !== 'content_manager') {
      return ctx.forbidden('Only Content Managers and Admins can delete blog posts.');
    }

    const { id } = ctx.params;

    try {
      const result = await strapi
        .service('api::blog-post.blog-post')
        .deleteBlogPost(id);

      return { data: result };
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return ctx.notFound('Blog post not found.');
      }
      return ctx.badRequest(err.message || 'Failed to delete blog post.');
    }
  },
}));
