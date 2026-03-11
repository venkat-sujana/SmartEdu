import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginRateLimiter = new RateLimiterMemory({
  points: 5,      // 5 requests
  duration: 60,   // per 60 seconds
});

export const apiRateLimiter = new RateLimiterMemory({
  points: 100,    // 100 requests
  duration: 60,   // per minute
});