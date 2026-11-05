import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`EduTrack API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error(reason, "Unhandled rejection");
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(error, "Uncaught exception");
  process.exit(1);
});

export default server;
