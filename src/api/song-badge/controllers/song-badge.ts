import { factories } from '@strapi/strapi';
import { periods } from '../../../../config/function/cron';

const periodNames: string[] = periods.map((item) => item[0]);

const getStartDate = (period: string, endDate: Date) => {
  const startDate = new Date(endDate);
  if (period === periodNames[3]) {
    return new Date(startDate.setMonth(startDate.getMonth() - 1));
  } else if (period === periodNames[2]) {
    return new Date(startDate.setDate(startDate.getDate() - 7));
  } else if (period === periodNames[1]) {
    return new Date(startDate.setDate(startDate.getDate() - 1));
  }
  // @todo This defaults to minute, though minute is only a test badge
  // I should better handle the default state
  return new Date(startDate.setMinutes(startDate.getMinutes() - 1));
};

export default factories.createCoreController(
  'api::song-badge.song-badge',
  ({ strapi }) => ({
    async create(ctx) {
      const period = ctx.params.period || periodNames[0];
      try {
        const knex = strapi.db.connection;

        const endDate = new Date();
        const startDate = getStartDate(period, endDate);

        if (!(startDate instanceof Date)) {
          ctx.throw(400, 'Invalid period specified');
        }

        const vote = await knex('votes')
          .join('votes_song_links', 'votes.id', '=', 'votes_song_links.vote_id')
          .select(
            'votes_song_links.song_id',
            knex.raw('COUNT(*) as vote_count'),
          )
          .whereBetween('votes.created_at', [startDate, endDate])
          .groupBy('votes_song_links.song_id')
          .orderBy('vote_count', 'desc')
          .first();

        if (!vote) {
          ctx.throw(
            400,
            `No vote was discovered for the time period of ${period}`,
          );
        }

        const badge = await strapi.db.query('api::badge.badge').findOne({
          where: { schedule: period },
        });

        if (!badge) {
          ctx.throw(400, `No badge was found for the time period of ${period}`);
        }

        const songBadge = await strapi.db
          .query('api::song-badge.song-badge')
          .create({
            data: {
              song: vote.song_id,
              badge: badge.id,
            },
          });

        return {
          id: songBadge.id,
          message: `Badge assigned for the period: ${period}`,
        };
      } catch (error) {
        // @todo Persist logs to file
        console.error(
          `Failed to assign badge for the period ${period}:`,
          error,
        );
        ctx.throw(
          500,
          `An error occurred while assigning badge for the period ${period}`,
        );
      }
    },
  }),
);
