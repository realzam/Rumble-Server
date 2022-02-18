import { Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ErrorResponse } from '../types/types';

const validarCampos = (
  req: Request,
  res: ErrorResponse,
  next: NextFunction,
) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      error: errors[0].msg,
    });
  }
  return next();
};

export default validarCampos;
