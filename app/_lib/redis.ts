import Redis from "ioredis";

const redisAiven = process.env.REDIS_AIVEN;
if (!redisAiven) {
  throw new Error("REDIS_AIVEN environment variable is not defined");
}
const redis = new Redis(redisAiven);

export default redis;
