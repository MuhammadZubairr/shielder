/**
 * Async handler wrapper for Express routes
 * Eliminates need for try-catch blocks in controllers
 * Automatically passes errors to Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
