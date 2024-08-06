// src/api/song/routes/fetchSong.ts

export default {
  routes: [
    {
      method: 'GET',
      path: '/song/fetch/:platform/:id',
      handler: 'api::song.song.fetchFromPlatform',
      config: {
        auth: false, // Set to true if authentication is required
      },
    },
  ],
};
