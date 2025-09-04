import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { env } from "./config/env";
import { connectDatabase } from "./config/db";
import router from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { setupSockets } from "./sockets";

async function bootstrap() {
  await connectDatabase();

  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
  app.use(limiter);

  app.use("/media", express.static("media"));
  app.use("/thumbnails", express.static("thumbnails"));
  app.use("/api", router);

  app.use(notFound);
  app.use(errorHandler);

  let server: http.Server | https.Server;
  if (
    env.httpsKeyPath &&
    env.httpsCertPath &&
    fs.existsSync(env.httpsKeyPath) &&
    fs.existsSync(env.httpsCertPath)
  ) {
    const key = fs.readFileSync(env.httpsKeyPath);
    const cert = fs.readFileSync(env.httpsCertPath);
    server = https.createServer({ key, cert }, app);
  } else {
    server = http.createServer(app);
  }

  const io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });
  setupSockets(io);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Server listening on ${env.port} (${
        env.httpsKeyPath && env.httpsCertPath ? "HTTPS" : "HTTP"
      })`
    );
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});

