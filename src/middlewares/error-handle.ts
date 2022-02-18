import { Request, NextFunction } from 'express';
import { CreateHttpError } from 'http-errors';
import { ErrorResponse } from '../types/types';

const errorHandleMiddleware = (
  error: CreateHttpError,
  req: Request,
  res: ErrorResponse,
  next: NextFunction,
) => {
  console.log('Error Handling Middleware called');
  console.log(error);

  console.log('Path: ', req.body);
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({
      ok: false,
      error: 'SyntaxError|Invalid JSON',
    });
  } else {
    next();
  }
};

export default errorHandleMiddleware;
