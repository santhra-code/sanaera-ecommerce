import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Falls back to "allow everything" when Upstash env vars aren't set, so the
// app still runs locally without a Redis instance — but this means rate
// limiting is NOT actually active until UPSTASH_REDIS_REST_URL/TOKEN are set.
// Don't ship to production without configuring these.
const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasUpstash ? Redis.fromEnv() : null;

function makeLimiter(requests: number, windowSeconds: number) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
  });
}

// Tuned per-endpoint: login/otp/reset are brute-forceable, checkout is not
// but still shouldn't be hammered.
const limiters = {
  login: makeLimiter(5, 60), // 5 attempts / minute / key
  otpRequest: makeLimiter(3, 300), // 3 codes / 5 min / key
  passwordReset: makeLimiter(3, 300),
  checkout: makeLimiter(10, 60),
};

export type RateLimitKind = keyof typeof limiters;

/**
 * `identifier` should be something like `login:${email}` or the caller's IP,
 * ideally both combined (e.g. `login:${ip}:${email}`) so a single IP can't
 * brute-force many accounts and a single account can't be brute-forced from
 * many IPs indefinitely.
 */
export async function checkRateLimit(kind: RateLimitKind, identifier: string) {
  const limiter = limiters[kind];
  if (!limiter) return { success: true, limited: false }; // Upstash not configured
  const result = await limiter.limit(identifier);
  return { success: result.success, limited: !result.success, remaining: result.remaining };
}
