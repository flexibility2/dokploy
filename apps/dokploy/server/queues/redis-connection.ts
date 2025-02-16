import type { ConnectionOptions } from "bullmq";

export const redisConfig: ConnectionOptions = {
  host:
    process.env.NODE_ENV === "production" &&
    process.env.SETUP_SERVICES === "true"
      ? "dokploy-redis"
      : "127.0.0.1",
};
