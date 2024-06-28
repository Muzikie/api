"use strict";

import { Strapi } from "@strapi/strapi";
import moment from "moment";

interface Vote {
  id: number;
  createdAt: Date;
  song: {
    id: number;
    name: string;
  };
  vote: boolean;
}

interface Song {
  id: number;
  name: string;
}

module.exports = {
  async findMostVoted(period: "day" | "week" | "month" | "year" | "minute") {
    let startDate: Date;
    switch (period) {
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
      case "minute":
        startDate = moment().startOf("minute").toDate();
        break;
      default:
        throw new Error("Invalid period");
    }

    const endDate = moment().toDate();

    // const result = await strapi.db.connection.raw(`
    //   SELECT
    //     song.id, song.name, COUNT(vote.id) AS vote_count
    //   FROM
    //     votes AS vote
    //   JOIN
    //     songs AS song
    //   ON
    //     vote.song_id = song.id
    //   WHERE
    //     vote.created_at BETWEEN ? AND ?
    //     AND vote.vote = true
    //   GROUP BY
    //     song.id
    //   ORDER BY
    //     vote_count DESC
    //   LIMIT 1
    // `, [startDate, endDate]);

    // const mostVotedSong: Song | undefined = result.rows[0];

    // if (mostVotedSong) {
    //   await strapi.db.query('api::song-badge.song-badge').create({
    //     data: {
    //       song: mostVotedSong.id,
    //       period,
    //       date: new Date(),
    //       nft_id: `nft-${period}-${moment().format('YYYYMMDD')}`,
    //       claimed: false,
    //       reward: 0,
    //     }
    //   });

    strapi.log.info(
      `Start Date: ${startDate} , End Date: ${endDate},  Perriod: ${period}`
    );
  },
};
