export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe((event) => {
      if (
        event.action === 'afterCreate' &&
        event.model.uid === 'plugin::users-permissions.user'
      ) {
        strapi
          .service('api::profile.profile')
          .addProfile(event.result.id);
      }
    });
  },
};