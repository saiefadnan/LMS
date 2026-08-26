/**
 * Custom course routes
 * 
 * Must be defined BEFORE the core router file (Strapi loads alphabetically).
 * This file adds the GET /api/courses/my endpoint for instructors.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/courses/my',
      handler: 'api::course.course.findMyCourses',
      config: {
        policies: ['global::is-instructor-or-admin'],
      },
    },
  ],
};
