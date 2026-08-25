/**
 * course service
 * 
 * Service layer that handles data operations.
 * The factory provides: find, findOne, create, update, delete
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::course.course');
