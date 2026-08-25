/**
 * course controller
 * 
 * Extends the default Strapi controller.
 * The factory gives us: find, findOne, create, update, delete
 * We'll add custom logic (like auto-setting instructor) later.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course');
