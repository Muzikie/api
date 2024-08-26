/**
 * project controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::project.project', ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Fetch the project to check ownership
    const project = await strapi.services.project.findOne({ id });

    if (!project || project.user_id !== user.id) {
      return ctx.unauthorized('Only the owner is allowed to update a project');
    }

    // Allow update if user is the owner
    return await strapi.services.project.update({ id }, ctx.request.body);
  }
}));
