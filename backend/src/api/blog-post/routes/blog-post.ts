import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::blog-post.blog-post', {
  config: {
    create: {
      policies: ['global::is-content-manager-or-admin'],
    },
    update: {
      policies: ['global::is-content-manager-or-admin'],
    },
    delete: {
      policies: ['global::is-content-manager-or-admin'],
    },
  },
});
