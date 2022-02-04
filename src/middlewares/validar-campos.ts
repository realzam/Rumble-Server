import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const validarCampos = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      ok: false,
      errors,
    });
  }
  return next();
};

export default validarCampos;
