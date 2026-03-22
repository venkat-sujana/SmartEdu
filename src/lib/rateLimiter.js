// src/lib/rateLimiter.js

import { RateLimiterMemory } from "rate-limiter-flexible";

export const loginRateLimiter = new RateLimiterMemory({
points: 10,     // 10 requests
  duration: 900,  // per 15 minutes
});

export const apiRateLimiter = new RateLimiterMemory({
  points: 1000,   // 1000 requests (increased for dev/testing)
  duration: 60,   // per minute
});
