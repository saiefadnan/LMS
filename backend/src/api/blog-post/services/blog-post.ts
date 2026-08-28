import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::blog-post.blog-post', ({ strapi }) => ({
  /**
   * Create blog post with auto-assigned author relation.
   */
  async createBlogPost(user: any, postData: any) {
    const safeData = { ...postData };
    delete safeData.author;

    const post = await strapi.documents('api::blog-post.blog-post').create({
      data: {
        ...safeData,
        author: user.id,
      },
      populate: ['author'],
    });

    return post;
  },

  /**
   * Role-aware listing: editors see all (published + drafts); public readers see only published.
   */
  async findBlogPosts(isEditor: boolean, queryParams: any = {}) {
    const filters = { ...(queryParams.filters || {}) };

    if (!isEditor) {
      filters.status = 'published';
    }

    return await strapi.documents('api::blog-post.blog-post').findMany({
      ...queryParams,
      filters,
      populate: ['author'],
      sort: queryParams.sort || 'createdAt:desc',
    });
  },

  /**
   * Role-aware single post lookup.
   */
  async findOneBlogPost(isEditor: boolean, idOrDocId: string) {
    const isNumeric = /^\d+$/.test(String(idOrDocId));
    let documentId = idOrDocId;

    if (isNumeric) {
      const found = await strapi.db.query('api::blog-post.blog-post').findOne({
        where: { id: Number(idOrDocId) },
      });
      if (!found) return null;
      documentId = found.documentId;
    }

    const post = await strapi.documents('api::blog-post.blog-post').findOne({
      documentId,
      populate: ['author'],
    });

    if (!post) return null;

    if (!isEditor && post.status !== 'published') {
      return null;
    }

    return post;
  },

  /**
   * Update blog post without overwriting author relation.
   */
  async updateBlogPost(idOrDocId: string, updateData: any) {
    const isNumeric = /^\d+$/.test(String(idOrDocId));
    let documentId = idOrDocId;

    if (isNumeric) {
      const found = await strapi.db.query('api::blog-post.blog-post').findOne({
        where: { id: Number(idOrDocId) },
      });
      if (!found) throw new Error('NOT_FOUND');
      documentId = found.documentId;
    }

    const safeData = { ...updateData };
    delete safeData.author;

    return await strapi.documents('api::blog-post.blog-post').update({
      documentId,
      data: safeData,
      populate: ['author'],
    });
  },

  /**
   * Delete a blog post.
   */
  async deleteBlogPost(idOrDocId: string) {
    const isNumeric = /^\d+$/.test(String(idOrDocId));
    let documentId = idOrDocId;

    if (isNumeric) {
      const found = await strapi.db.query('api::blog-post.blog-post').findOne({
        where: { id: Number(idOrDocId) },
      });
      if (!found) throw new Error('NOT_FOUND');
      documentId = found.documentId;
    }

    return await strapi.documents('api::blog-post.blog-post').delete({
      documentId,
    });
  },
}));
