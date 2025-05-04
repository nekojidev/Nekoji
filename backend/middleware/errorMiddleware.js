import logger from "../utils/logger.js";


const errorMiddleware = (err, req, res, next) => {

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode)

  logger.error(`Error: ${err.message}, Stack: ${err.stack}`);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
}


export default errorMiddleware;
