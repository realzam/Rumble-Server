import express from 'express';
import jwt from 'jsonwebtoken';
// import { ErrorResponse } from '../types/types';

const validarJWTMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const token = req.header('x-Token');
    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'Token no recibido',
      });
    }
    jwt.verify(token, process.env.JWT_KEY);
    req.token = token;
    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: 'Token no es valido',
    });
  }
};

export default validarJWTMiddleware;
