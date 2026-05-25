import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

type ErrorLike = {
  statusCode?: number;
  message?: string;
  stack?: string;
};

const getErrorStatusCode = (error: ErrorLike) => {
  if (typeof error.statusCode === 'number') {
    return error.statusCode;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return httpStatus.BAD_REQUEST;
  }

  return httpStatus.INTERNAL_SERVER_ERROR;
};

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = getErrorStatusCode(error as ErrorLike);
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack })
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
