import { Strapi } from "@strapi/strapi";

export const scheduleMostVotedSongTasks = {
  "0 0 * * *": {
    task: async ({ strapi }: { strapi: Strapi }) => {
      // Every day at midnight
      await strapi.service("api::song.song-query").findMostVoted("day");
    },
    options: {
      tz: "UTC",
    },
  },
  "0 0 * * 0": {
    task: async ({ strapi }: { strapi: Strapi }) => {
      // Every week at midnight on Sunday
      await strapi.service("api::song.song-query").findMostVoted("week");
    },
    options: {
      tz: "UTC",
    },
  },
  "0 0 1 * *": {
    task: async ({ strapi }: { strapi: Strapi }) => {
      // Every month at midnight on the 1st
      await strapi.service("api::song.song-query").findMostVoted("month");
    },
    options: {
      tz: "UTC",
    },
  },
  "0 0 1 1 *": {
    task: async ({ strapi }: { strapi: Strapi }) => {
      // Every year at midnight on January 1st
      await strapi.service("api::song.song-query").findMostVoted("year");
    },
    options: {
      tz: "UTC",
    },
  },
  "* * * * * *": {
    task: async ({ strapi }: { strapi: Strapi }) => {
      // Every second
      // Example task: Logging a message every second
      await strapi.service("api::song.song-query").findMostVoted("second");
    },
    options: {
      tz: "UTC",
    },
  },
};

export default scheduleMostVotedSongTasks;
