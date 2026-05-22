const attempts = new Map();

export function checkRateLimit(key, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= limit;
}
