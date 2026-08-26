/**
 * Custom enrollment routes
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/enrollments/my',
      handler: 'api::enrollment.enrollment.findMyEnrollments',
      config: {
        policies: [],
      },
    },
  ],
};
