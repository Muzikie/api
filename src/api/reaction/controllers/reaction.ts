/**
 * reaction controller
 */

import { factories } from '@strapi/strapi'
import { AllowedEmojis, EntityTypes } from '../../../constants/reaction';

export default factories.createCoreController(
  'api::reaction.reaction',
  ({ strapi }) => ({
    // POST
    async create(ctx) {
      const { user } = ctx.state;
      const reactionDoc = strapi.documents('api::reaction.reaction');
      const projectDoc = strapi.documents('api::project.project');

      try {
        const { project, emoji } = ctx.request.body.data;

        // Validate that the emoji is one of the allowed set
        if (!AllowedEmojis.includes(emoji)) {
          return ctx.badRequest('Invalid emoji');
        }

        // Check if the user has already reacted to this project
        const existingReaction = await reactionDoc.findMany({
          filters: {
            users_permissions_user: user.id,
            project,
            entity_type: EntityTypes.Project,
          },
        });

        if (existingReaction.length > 0) {
          // If the reaction exists, update it
          const documentId = existingReaction[0].documentId;
          const updatedReaction = await reactionDoc.update({
            documentId,
            data: {
              emoji,
            },
          });

          const sanitizedEntity = await this.sanitizeOutput(
            updatedReaction,
            ctx,
          );
          return this.transformResponse(sanitizedEntity);
        } else {
          // Otherwise, create a new reaction
          let reaction = await reactionDoc.create({
            data: {
              emoji,
              users_permissions_user: user.id,
              project,
              entity_type: EntityTypes.Project,
            },
          });
          // const publishResult = await reactionDoc.publish({
          //   documentId: reaction.documentId,
          // });
          // reaction = publishResult.entries[0];
          // Increment project reaction count
          const [projectData] = await projectDoc.findMany({
            filters: {
              id: project,
            },
          });
          
          await projectDoc.update({
            documentId: projectData.documentId,
            data: {
              reaction_count: projectData.reaction_count + 1,
            },
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
      const reactionDoc = strapi.documents('api::reaction.reaction');
      const projectDoc = strapi.documents('api::project.project');

      const { id } = ctx.params;
      const user = ctx.state.user;

      // Find the reaction to ensure it belongs to the user
      const reaction = await reactionDoc.findMany({
        filters: {
          users_permissions_user: user.id,
          project: id,
          entity_type: EntityTypes.Project,
        },
      });

      if (!reaction.length) {
        return ctx.notFound('Reaction not found');
      }

      // Delete the reaction
      await reactionDoc.delete({
        documentId: reaction[0].documentId,
      });

      // Decrement project reaction count
      const [{ documentId, reaction_count }] = await projectDoc.findMany({
        filters: {
          id,
        },
      });

      await projectDoc.update({
        documentId,
        data: {
          reaction_count: reaction_count - 1,
        },
      });

      // Respond
      return ctx.send({ message: 'Reaction deleted successfully' });
    },
  }),
);
