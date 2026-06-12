import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  lazyConnect: true, // Don't connect until first command
  retryStrategy: (times) => {
    // Retry with exponential backoff, max 30s
    const delay = Math.min(times * 500, 30000);
    console.warn(`[Redis] Reconnecting... attempt ${times} (delay: ${delay}ms)`);
    return delay;
  },
});

redis.on('connect', () => console.log('✅ [Redis] Connected successfully.'));
redis.on('error', (err) => console.error('❌ [Redis] Connection error:', err.message));
