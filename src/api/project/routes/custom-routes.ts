export default {
  routes: [
    {
      method: 'GET',
      path: '/projects',
      handler: 'project.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/projects/feed',
      handler: 'project.feed',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/projects/:id',
      handler: 'project.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/projects',
      handler: 'project.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/projects/:id',
      handler: 'project.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/projects/:id',
      handler: 'project.delete',
      config: {
        policies: [],
      },
    },
  ],
};
