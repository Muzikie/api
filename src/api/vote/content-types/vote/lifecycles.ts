export default {
  async beforeCreate(event) {
    const { data } = event.params;
    // const userId = data.users_permissions_user.connect[0].id;
    const userId = event.state?.user?.id;
    console.log('userId', event.state);
    const songId = data.song.connect[0].id;

    // Check if a vote already exists for the user and song
    const existingVote = await strapi.db.query('api::vote.vote').findOne({
      where: {
        users_permissions_user: userId,
        song: songId,
      },
    });

    if (existingVote) {
      throw new Error('User has already voted for this song');
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;
    const { id } = where;

    // const userId = data.users_permissions_user?.connect?.[0]?.id;
    const userId = event.state?.user?.id;
    console.log('userId', event.state);
    const songId = data.song?.connect?.[0]?.id;

    if (!userId || !songId) {
      console.log('User ID or Song ID is missing in the update data');
      return;
    }

    // Check if a vote already exists for the user and song
    const existingVote = await strapi.db.query('api::vote.vote').findOne({
      where: {
        users_permissions_user: userId,
        song: songId,
        id: { $ne: id }, // Exclude the current vote being updated
      },
    });

    if (existingVote) {
      throw new Error('User has already voted for this song');
    }
  },
};
