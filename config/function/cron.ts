export const periods = [
  ['* * * * *', 'minute'],
  ['0 0 * * *', 'day'],
  ['0 0 * * 0', 'week'],
  ['0 0 1 * *', 'month'],
];

const scheduleMostVotedSongTasks = periods.reduce((acc, [rule, period]) => {
  // The song-of-the-minute is only activated for test purpose via the ENABLE_MINUTE_BADGE flag
  if (process.env.ENABLE_MINUTE_BADGE === 'false' && period === 'minute') {
    return acc;
  }

  acc[`${period}Badge`] = {
    task: ({ strapi }) =>
      strapi
        .controller('api::song-badge.song-badge')
        .create({ params: { period } }),
    options: {
      rule,
      tz: 'UTC',
    },
  };
  return acc;
}, {});

export default scheduleMostVotedSongTasks;
