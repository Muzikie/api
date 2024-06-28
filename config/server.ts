import scheduleMostVotedSongTasks from "./function/cron";

export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  cron: {
    enabled: env.bool("CRON_ENABLED", true),
    tasks: scheduleMostVotedSongTasks,
  },
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
});
