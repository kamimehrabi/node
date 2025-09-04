import { createQueue } from "../config/redis";

export const { queue: emailQueue } = createQueue("email");
export const { queue: thumbnailQueue } = createQueue("thumbnail");

