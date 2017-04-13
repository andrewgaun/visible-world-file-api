import { HttpStatusError } from 'common-errors';

export default function errorHandler(err, req, res, next) {
  if (!err) {
    if (next) return next();
    return res.end();
  }

  const httpErr = new HttpStatusError(err, req);

  if (httpErr.status_code >= 500) {
    console.error(httpErr.stack);
    httpErr.message = HttpStatusError.message_map[500];
  }

  res.status(httpErr.status_code);

  const json = {
    status: httpErr.status_code,
    title: err.name,
    detail: httpErr.message,
  };

  return res.json(json);
}
