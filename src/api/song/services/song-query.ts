"use strict";

const moment = require("moment");

module.exports = {
  async findMostVoted(period) {
    let startDate;
    switch (period) {
      case "minute":
        startDate = moment().startOf("minute").toDate();
        break;
      case "day":
        startDate = moment().startOf("day").toDate();
        break;
      case "week":
        startDate = moment().startOf("week").toDate();
        break;
      case "month":
        startDate = moment().startOf("month").toDate();
        break;
      case "year":
        startDate = moment().startOf("year").toDate();
        break;
      default:
        throw new Error("Invalid period");
    }

    const endDate = moment().toDate();

    const votes = await strapi.db.query("api::vote.vote").findMany({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        vote: true, // considering only positive votes
      },
      populate: ["song"],
    });

    // const voteCount = votes.reduce((acc, vote) => {
    //   const songId = vote.song.id;
    //   if (!acc[songId]) acc[songId] = 0;
    //   acc[songId]++;
    //   return acc;
    // }, {});

    // const mostVotedSongId = Object.keys(voteCount).reduce((a, b) =>
    //   voteCount[a] > voteCount[b] ? a : b
    // );

    // const mostVotedSong = await strapi.db
    //   .query("api::song.song")
    //   .findOne({ where: { id: mostVotedSongId } });

    // await strapi.db.query('api::song-badge.song-badge').create({
    //   data: {
    //     song: mostVotedSong.id,
    //     period,
    //     date: new Date(),
    //     nft_id: `nft-${period}-${moment().format('YYYYMMDD')}`,
    //     claimed: false,
    //     reward: 0,
    //   }
    // });

    strapi.log.info(`Most voted song for ${period} is ${votes[1]}`);
  },
};
