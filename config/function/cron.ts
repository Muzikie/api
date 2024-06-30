const periods = [
  ["0 0 * * *", "day"],
  ["0 0 * * 0", "week"],
  ["0 0 1 * *", "month"],
  ["0 0 1 1 *", "year"],
  ["* * * * *", "minute"],
];

const scheduleMostVotedSongTasks = periods.reduce((acc, [rule, period]) => {
  acc[`${period}SongBadge`] = {
    task: async ({ strapi }) => {
      return await strapi
        .controller("api::song-badge.song-badge")
        .create({}, period);
    },
    options: {
      rule,
      tz: "UTC",
    },
  };
  return acc;
}, {});

export default scheduleMostVotedSongTasks;

//
