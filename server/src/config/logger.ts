import pino from "pino";

export const logger = pino({
  level: env.IS_DEVELOPMENT ? "debug" : "info",
  transport: env.IS_DEVELOPMENT
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

import { env } from "./env";
