/**
 * reaction controller
 */

import { factories } from '@strapi/strapi';
import { AllowedEmojis, EntityTypes } from '../../../constants/reaction';

export default factories.createCoreController('api::reaction.reaction', ({ strapi }) => ({
  // POST
  async create(ctx) {
    const { user } = ctx.state;

    try {
      const { project, emoji } = ctx.request.body.data;
  
      // Validate that the emoji is one of the allowed set
      if (!AllowedEmojis.includes(emoji)) {
        return ctx.badRequest('Invalid emoji');
      }

      // Check if the user has already reacted to this project
      const existingReaction = await strapi.entityService.findMany('api::reaction.reaction', {
        filters: {
          users_permissions_user: user.id,
          project: project,
          entity_type: EntityTypes.Project,
        },
      });

      if (existingReaction.length > 0) {
        // If the reaction exists, update it
        const reactionId = existingReaction[0].id;
        const updatedReaction = await strapi.entityService.update('api::reaction.reaction', reactionId, {
          data: {
            emoji,
          },
        });

        const sanitizedEntity = await this.sanitizeOutput(updatedReaction, ctx);
        return this.transformResponse(sanitizedEntity);
      } else {
        // Otherwise, create a new reaction
        const reaction = await strapi.entityService.create('api::reaction.reaction', {
          data: {
            emoji,
            users_permissions_user: user.id,
            project: project,
            entity_type: EntityTypes.Project,
            publishedAt: new Date(),
          },
        });

        // Increment project reaction count
        const { reaction_count } = await strapi.entityService.findOne('api::project.project', project);
        await strapi.entityService.update('api::project.project', project, {
          data: {
            reaction_count: reaction_count + 1,
          }
        });

        // Respond
        const sanitizedEntity = await this.sanitizeOutput(reaction, ctx);
        return this.transformResponse(sanitizedEntity);
      }
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // DELETE
  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Find the reaction to ensure it belongs to the user
    const reaction = await strapi.entityService.findMany('api::reaction.reaction', {
      filters: {
        project: id,
        users_permissions_user: user.id,
      },
    });

    if (!reaction.length) {
      return ctx.notFound('Reaction not found');
    }

    // Delete the reaction
    await strapi.entityService.delete('api::reaction.reaction', reaction[0].id);

    // Decrement project reaction count
    const { reaction_count } = await strapi.entityService.findOne('api::project.project', id);
    await strapi.entityService.update('api::project.project', id, {
      data: {
        reaction_count: reaction_count - 1,
      }
    });

    // Respond
    return ctx.send({ message: 'Reaction deleted successfully' });
  }
}));
