/**
 * course router
 * 
 * This uses Strapi's createCoreRouter factory which auto-generates
 * CRUD routes: find, findOne, create, update, delete
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::course.course');
