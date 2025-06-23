import { logger } from "../utils/logger.mjs";

const handlerMiddleware = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  logger.error('[API ERROR]', {
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: '서버 오류 발생',
    ...(isProd ? {} : { message: err.message, stack: err.stack }),
  });
};

export default handlerMiddleware;