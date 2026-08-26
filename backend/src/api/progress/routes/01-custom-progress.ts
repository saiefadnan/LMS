/**
 * Custom progress routes
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/progresses/my/:courseDocumentId',
      handler: 'api::progress.progress.findMyProgress',
      config: {
        policies: [],
      },
    },
  ],
};
