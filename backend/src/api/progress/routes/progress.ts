import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::progress.progress', {
  config: {
    create: {
      policies: ['global::is-student'],
    },
    update: {
      policies: ['global::is-student'],
    },
    delete: {
      policies: ['global::is-admin'],
    },
  },
});
