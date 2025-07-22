export default {
  routes: [
    {
      method: 'GET',
      path: '/contributions',
      handler: 'contribution.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/contributions/overview',
      handler: 'contribution.getOverview',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/contributions/:id',
      handler: 'contribution.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/contributions',
      handler: 'contribution.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/contributions/:id',
      handler: 'contribution.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/contributions/:id',
      handler: 'contribution.delete',
      config: {
        policies: [],
      },
    },
  ],
};
