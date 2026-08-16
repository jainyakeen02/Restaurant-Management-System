// Simple In-Memory Idempotency Cache (For Production use Redis)
const idempotencyCache = new Set();

const idempotencyMiddleware = (req, res, next) => {
  const idempotencyKey = req.headers["x-idempotency-key"];

  if (!idempotencyKey) {
    return next(); // If no key is provided, bypass idempotency check
  }

  if (idempotencyCache.has(idempotencyKey)) {
    return res.status(409).json({
      success: false,
      message: "Duplicate request detected based on Idempotency Key",
    });
  }

  // Store key (In production, set a TTL like 24 hours in Redis)
  idempotencyCache.add(idempotencyKey);
  
  next();
};

module.exports = idempotencyMiddleware;
