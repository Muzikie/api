const periods = {
	'0 0 * * *': 'day', // Every day at midnight
	'0 0 * * 0': 'week', // Every week at midnight on Sunday
	'0 0 1 * *': 'month', // Every month at midnight on the 1st
	'0 0 1 1 *': 'year', // Every year at midnight on January 1st
	'*/1 * * * *': 'minute' // Every minute
};
  
const scheduleMostVotedSongTasks = Object.fromEntries(
	Object.entries(periods).map(([rule, period]) => [
		rule,
	  {
		task: async ({ strapi }) => {
		  await strapi.service('api::song.song-query').findMostVoted(period);
		},
		options: {
		  rule,
		  tz: 'UTC'
		}
	  }
	])
  );
  
  export default scheduleMostVotedSongTasks;
  