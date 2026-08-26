/**
 * course router
 * 
 * This uses Strapi's createCoreRouter factory which auto-generates
 * CRUD routes: find, findOne, create, update, delete
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::course.course', {
  config: {
    create: {
      policies: ['global::is-owner-or-admin'],
    },
    update: {
      policies: ['global::is-owner-or-admin'],
    },
    delete: {
      policies: ['global::is-owner-or-admin'],
    },
  },
});
