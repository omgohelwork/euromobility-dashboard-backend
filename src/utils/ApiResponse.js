/**
 * Consistent API response helpers.
 * All responses use UTF-8 (Express default with charset in app).
 */
export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function error(res, message, statusCode = 400, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
}

export function notFound(res, resource = 'Risorsa') {
  return res.status(404).json({ success: false, error: `${resource} non trovata` });
}
