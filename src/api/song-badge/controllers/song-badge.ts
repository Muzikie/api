/**
 * song-badge controller
 */

// Create a controller to ensure the user who wants to claim the song badge is
// the owner of the song.
// This controller should be able to sign the transaction on user's behalf.

// We need another controller to create a new song badge every day/week/month for the winner song.
// This logic should run using a cron job for each badge type.
// This controller has to define the winner.
// It should read the config from the badge stored in DB
// schedule: 0 0 * * * (every day at midnight) -> Select winner from the songs of the day before
// schedule: 0 0 * * 1 (every monday at midnight) -> Select winner from the songs of the week before
// schedule: 0 0 1 * * (every first day of the month at midnight) -> Select winner from the songs of the month

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::song-badge.song-badge",
  ({ strapi }) => ({
    async create(ctx, period) {
      try {
        const songBadge = await strapi
          .service("api::song-badge.song-badge")
          .createSongBadge(period);

        ctx.body = songBadge;
      } catch (error) {
        ctx.status = 500;
        ctx.body = { message: error.message };
      }
    },
  })
);
