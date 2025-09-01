import { createClient, type RedisClientType } from "redis";

export const pub: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

pub.on("error", (err) => console.error("Redis Client Error:", err));

export async function connectRedis() {
  if (!pub.isOpen) {
    await pub.connect();
    console.log("Connected to Redis");
  }
}
