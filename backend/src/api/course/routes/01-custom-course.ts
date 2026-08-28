/**
 * Custom course routes
 * 
 * Must be defined BEFORE the core router file (Strapi loads alphabetically).
 * This file adds:
 *  - GET /api/courses/my (courses belonging to authenticated instructor)
 *  - GET /api/courses/:documentId/students-progress (student progress for a course)
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/courses/my',
      handler: 'api::course.course.findMyCourses',
      config: {
        policies: ['global::is-course-manager'],
      },
    },
    {
      method: 'GET',
      path: '/courses/:documentId/students-progress',
      handler: 'api::course.course.getCourseStudentProgress',
      config: {
        policies: ['global::is-course-manager'],
      },
    },
  ],
};
