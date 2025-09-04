import { Queue, QueueEvents } from "bull";
import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.redisUrl);

export function createQueue(name: string) {
  const queue = new Queue(name, {
    connection: { host: "127.0.0.1", port: 6379 },
  });
  const events = new QueueEvents(name, {
    connection: { host: "127.0.0.1", port: 6379 },
  });
  return { queue, events };
}

