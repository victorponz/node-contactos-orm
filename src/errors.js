export class HttpError extends Error {
  constructor(status, message) {
    super(Array.isArray(message) ? message.join(', ') : message);
    this.status = status;
    this.details = Array.isArray(message) ? message : undefined;
  }
}

const isApi = (req) => req.originalUrl.startsWith('/api/');

export function notFound(req, res, next) {
  next(new HttpError(404, `Cannot ${req.method} ${req.path}`));
}

// Middleware de errores: responde JSON en /api y una página HTML en el resto
export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  if (status === 500) console.error(err);
  const message = err.details ?? (status === 500 ? 'Internal server error' : err.message);

  res.status(status);
  if (isApi(req)) return res.json({ statusCode: status, message });
  res.render('error', { title: `Error ${status}`, status, message });
}
