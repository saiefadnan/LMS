import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a blog post.');
    }

    if (user.role?.type !== 'admin' && user.role?.type !== 'content_manager') {
      return ctx.forbidden('Only Content Managers and Admins can create blog posts.');
    }

    // Remove author from body if sent (Strapi v5 handles relations server-side)
    if (ctx.request.body?.data?.author) {
      delete ctx.request.body.data.author;
    }

    const response = await super.create(ctx);

    // Link author relation via Document Service
    if (response?.data?.documentId) {
      await strapi.documents('api::blog-post.blog-post').update({
        documentId: response.data.documentId,
        data: {
          author: user.id,
        },
      });
    }

    return response;
  },

  async find(ctx) {
    const user = ctx.state.user;
    const isEditor = user && (user.role?.type === 'admin' || user.role?.type === 'content_manager');

    // If not editor, only allow viewing published posts
    if (!isEditor) {
      ctx.query.filters = {
        ...(ctx.query.filters || {}),
        status: 'published',
      };
    }

    return super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const isEditor = user && (user.role?.type === 'admin' || user.role?.type === 'content_manager');

    if (!isEditor) {
      const { id } = ctx.params;
      const post = await strapi.db.query('api::blog-post.blog-post').findOne({
        where: { documentId: id },
      });

      if (!post || post.status !== 'published') {
        return ctx.notFound('Blog post not found.');
      }
    }

    return super.findOne(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (user.role?.type !== 'admin' && user.role?.type !== 'content_manager') {
      return ctx.forbidden('Only Content Managers and Admins can edit blog posts.');
    }

    // Protect author relation from being overwritten via Content API
    if (ctx.request.body?.data?.author) {
      delete ctx.request.body.data.author;
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (user.role?.type !== 'admin' && user.role?.type !== 'content_manager') {
      return ctx.forbidden('Only Content Managers and Admins can delete blog posts.');
    }

    return super.delete(ctx);
  },
}));
