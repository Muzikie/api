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
}));
