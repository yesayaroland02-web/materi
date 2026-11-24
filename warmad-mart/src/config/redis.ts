
import "dotenv/config";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL atau UPSTASH_REDIS_REST_TOKEN belum dikonfigurasi"
  );
}

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});
