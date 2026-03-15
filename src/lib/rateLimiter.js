// src/lib/rateLimiter.js

import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginRateLimiter = new RateLimiterMemory({
  points: 5,      // 5 requests
  duration: 60,   // per 60 seconds
});

export const apiRateLimiter = new RateLimiterMemory({
  points: 1000,   // 1000 requests (increased for dev/testing)
  duration: 60,   // per minute
});
