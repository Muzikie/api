/**
 * song controller
 */

import { factories } from '@strapi/strapi';
import musicService from '../services/music';

export default factories.createCoreController('api::song.song', ({ strapi }) => ({
  async find(ctx) {
    // Call the default core controller find method to get all songs
    const { data, meta } = await super.find(ctx);

    const userId = ctx.state.user.id;

    // Fetch votes for the current user
    const votes = await strapi.entityService.findMany('api::vote.vote', {
      filters: { users_permissions_user: userId },
      populate: { song: true },
    });

    const votedSongIds = votes.map(vote => vote.song.id);

    // Add the 'hasVoted' flag to each song
    const modifiedData = data.map(song => ({
      ...song,
      attributes: {
        ...song.attributes,
        hasVoted: votedSongIds.includes(song.id),
      },
    }));

    return { data: modifiedData, meta };
  },

  async fetchFromPlatform(ctx) {
    const { platform, id } = ctx.params;

    try {
      const data = await musicService.fetchFromPlatform(platform, id);
      ctx.send(data);
    } catch (error) {
      ctx.status = 500;
      ctx.send({ error: 'Failed to fetch data from the music platform' });
    }
  },
  async create(ctx) {
    // Extract user ID from JWT token in the context
    const userId = ctx.state.user?.id;

    // Ensure the user ID is present
    if (!userId) {
      return ctx.badRequest('User ID is missing');
    }

    // Get the start and end of the current week
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Count the number of songs posted by the user this week
    const songCountThisWeek = await strapi.db.query('api::song.song').count({
      where: {
        users_permissions_user: userId,
        createdAt: { $gte: startOfWeek.toISOString(), $lt: endOfWeek.toISOString() },
      },
    });

    // Check if the user has exceeded the limit of 1 songs per week
    if (songCountThisWeek >= 1) {
      return ctx.badRequest('You have already posted a song this week.');
    }

    // Proceed with creating the song
    return super.create(ctx);
  },

}));
