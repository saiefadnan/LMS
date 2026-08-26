import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::quiz-result.quiz-result', {
  config: {
    create: {
      policies: ['global::is-student'],
    },
    update: {
      policies: ['global::is-admin'],
    },
    delete: {
      policies: ['global::is-admin'],
    },
  },
});
