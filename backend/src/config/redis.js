const Redis = require('ioredis');
require('dotenv').config();

// Create Redis client.
// This client will try to connect, but we don't want Redis to crash the whole server.
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || null,
    username: process.env.REDIS_USER_NAME || 'default',
    retryStrategy: (times) => Math.min(times * 50, 2000),
    enableReadyCheck: false,
    enableOfflineQueue: true
});

redis.on('connect', () => console.log(' Redis connected'));
redis.on('error', (err) => console.warn(' Redis error:', err.message));

module.exports = redis;

