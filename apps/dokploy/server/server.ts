import http from "node:http";
import { migration } from "@/server/db/migration";
import {
  IS_CLOUD,
  createDefaultMiddlewares,
  createDefaultServerTraefikConfig,
  createDefaultTraefikConfig,
  initCronJobs,
  initializeNetwork,
  initializePostgres,
  initializeRedis,
  initializeTraefik,
  sendDokployRestartNotifications,
  setupDirectories,
} from "@dokploy/server";
import { config } from "dotenv";
import next from "next";
import { setupDockerContainerLogsWebSocketServer } from "./wss/docker-container-logs";
import { setupDockerContainerTerminalWebSocketServer } from "./wss/docker-container-terminal";
import { setupDockerStatsMonitoringSocketServer } from "./wss/docker-stats";
import { setupDeploymentLogsWebSocketServer } from "./wss/listen-deployment";
import { setupTerminalWebSocketServer } from "./wss/terminal";

config({ path: ".env" });
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: process.env.TURBOPACK === "1" });
const handle = app.getRequestHandler();
void app.prepare().then(async () => {
  try {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    // WEBSOCKET
    setupDeploymentLogsWebSocketServer(server);
    setupDockerContainerLogsWebSocketServer(server);
    setupDockerContainerTerminalWebSocketServer(server);
    setupTerminalWebSocketServer(server);
    if (!IS_CLOUD) {
      setupDockerStatsMonitoringSocketServer(server);
    }

    // 只在云端生产环境下执行数据库迁移
    if (IS_CLOUD && process.env.NODE_ENV === "production") {
      await migration();
    }

    // 只在非云端且明确指定 SETUP_SERVICES=true 时初始化服务
    if (!IS_CLOUD && process.env.SETUP_SERVICES === "true") {
      setupDirectories();
      createDefaultMiddlewares();
      await initializeNetwork();
      createDefaultTraefikConfig();
      createDefaultServerTraefikConfig();
      await initializePostgres();
      await initializeTraefik();
      await initializeRedis();
      initCronJobs();

      if (process.env.NODE_ENV === "production") {
        await new Promise((resolve) => setTimeout(resolve, 7000));
        await migration();
        await sendDokployRestartNotifications();
      }
    }

    server.listen(PORT);
    console.log("Server Started:", PORT);

    // 只在开发环境或明确指定 SETUP_SERVICES=true 时启动 Worker
    if (
      !IS_CLOUD &&
      (process.env.NODE_ENV !== "production" ||
        process.env.SETUP_SERVICES === "true")
    ) {
      console.log("Starting Deployment Worker");
      const { deploymentWorker } = await import("./queues/deployments-queue");
      await deploymentWorker.run();
    }
  } catch (e) {
    console.error("Main Server Error", e);
  }
});
