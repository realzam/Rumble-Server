import { Request, Response, NextFunction } from 'express';
import { CreateHttpError } from 'http-errors';

const errorHandleMiddleware = (
  error: CreateHttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Error Handling Middleware called');
  console.log(error);

  console.log('Path: ', req.body);
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({
      status: 400,
      ok: false,
      errors: [
        {
          value: error.body,
          param: '',
          location: 'body',
          msg: 'SyntaxError|Invalid JSON',
        },
      ],
    });
  } else {
    next();
  }
};

export default errorHandleMiddleware;
