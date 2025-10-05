import * as express from 'express';

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn: Function) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('❌ Async handler caught error:', {
        path: req.path,
        method: req.method,
        error: error.message,
        stack: error.stack
      });
      next(error);
    });
  };
};

/**
 * Error logging middleware
 */
export const errorLogger = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    }
  };

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ERROR CAUGHT BY MIDDLEWARE');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(JSON.stringify(errorInfo, null, 2));
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // In production, send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, or other service
    // Example: Sentry.captureException(error);
  }

  next(error);
};

/**
 * Final error handler - sends response to client
 */
export const finalErrorHandler = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Prevent multiple responses
  if (res.headersSent) {
    return next(error);
  }

  // Determine status code
  const statusCode = error.status || error.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      code: error.code,
      errno: error.errno,
      stack: error.stack
    } : undefined
  });
};

/**
 * Safe JSON parse with error handling
 */
export const safeJsonParse = (str: string, fallback: any = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    return fallback;
  }
};

/**
 * Database operation wrapper with retry logic
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`❌ Request timeout: ${req.method} ${req.path}`);
        res.status(408).json({
          success: false,
          message: 'Request timeout'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

