// src/api/vote/controllers/vote.ts

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::vote.vote', ({ strapi }) => ({
  async create(ctx) {
    // Extract user ID from JWT token in the context
    const userId = ctx.state.user?.id;

    // Ensure the request body is structured correctly
    const { song: songId } = ctx.request.body.data;

    // Check if userId and songId are provided
    if (!userId || !songId) {
      return ctx.badRequest('User ID or Song ID is missing');
    }

    // Check if a vote already exists for the user and song
    const existingVote = await strapi.db.query('api::vote.vote').findOne({
      where: {
        users_permissions_user: userId,
        song: songId,
      },
    });

    if (existingVote) {
      return ctx.badRequest('User has already voted for this song');
    }

    // Attach the user ID to the vote data
    ctx.request.body.data.users_permissions_user = userId;

    // Proceed with creating the vote
    return super.create(ctx);
  },
}));
