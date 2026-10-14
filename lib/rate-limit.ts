import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Local development can run without Redis. In production, fail closed when
// rate limiting is not configured rather than silently allowing brute force.
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
  newsletter: makeLimiter(5, 3600),
  contact: makeLimiter(5, 3600),
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
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error("Upstash rate limiting is not configured in production.");
      return { success: false, limited: true, remaining: 0 };
    }
    return { success: true, limited: false };
  }
  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, limited: !result.success, remaining: result.remaining };
  } catch (error) {
    console.error("Upstash rate-limit request failed; rejecting the request.", error);
    return { success: false, limited: true, remaining: 0 };
  }
}
