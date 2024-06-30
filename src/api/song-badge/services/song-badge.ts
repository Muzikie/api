// src/api/song-badge/services/song-badge.ts

import moment from "moment";
import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::song-badge.song-badge",
  ({ strapi }) => ({
    async createSongBadge(period: any) {
      const startDate = moment().startOf(period).toDate();
      const endDate = moment().endOf(period).toDate();

      console.log(endDate);
      console.log(startDate);

      const votes = await strapi.entityService.findMany("api::song.song", {
        populate: {
          votes: {
            populate: "*",
            // filters: {
            //   createdAt: {
            // 	$gte: startDate,
            // 	$lte: endDate
            //   }
            // },
            sort: ["createdAt:desc"],
          },
        },
      });

      const mostVotedSong = votes.reduce((acc, song) => {
        if (!acc || song.votes.length > acc.votes.length) {
          return song;
        }
        return acc;
      }, null);

      const songBadge = {
        data: {
          song: mostVotedSong.id,
          count: mostVotedSong.votes.length,
          badge: `${period}badge`,
          nft_id: null,
          claimed: false,
          reward: null,
        },
      };

      console.log(songBadge);

      //   return await strapi.entityService.create(
      //     "api::song-badge.song-badge",
      //     songBadge
      //   );
    },
  })
);
