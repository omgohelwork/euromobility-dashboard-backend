/**
 * Global error handler. Ensures proper status and JSON response.
 * Sends UTF-8 and avoids leaking stack in production.
 */
export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Errore interno del server';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
  });
}
