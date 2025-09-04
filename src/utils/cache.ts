import { redis } from "../config/redis";

const DEFAULT_TTL_SECONDS = 60; // 1 minute cache for listing

export function buildJobsListCacheKey(query: any): string {
  const allowedKeys = [
    "page",
    "limit",
    "sort",
    "order",
    "search",
    "location",
    "employmentType",
    "experienceLevel",
    "minSalary",
    "maxSalary",
  ];
  const normalized: Record<string, string> = {};
  for (const key of allowedKeys) {
    const value = query[key];
    if (value !== undefined && value !== null && String(value).length > 0) {
      normalized[key] = String(value);
    }
  }
  const encoded = Object.keys(normalized)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(normalized[k])}`)
    .join("&");
  return `jobs:list:${encoded}`;
}

export async function getCachedJson<T = any>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson(
  key: string,
  value: any,
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function invalidateJobListCache() {
  // Simple invalidation for dev: scan and delete
  const pattern = "jobs:list:*";
  let cursor = "0";
  do {
    // eslint-disable-next-line no-await-in-loop
    const res = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = res[0];
    const keys: string[] = res[1] as any;
    if (keys.length) {
      // eslint-disable-next-line no-await-in-loop
      await redis.del(...keys);
    }
  } while (cursor !== "0");
}
