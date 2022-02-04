import express from 'express';
import jwt from 'jsonwebtoken';

interface IPayload {
  uid: string;
  iat: number;
  exp: number;
}

const validarJWTMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const token = req.header('x-Token');
    if (!token) {
      return res.status(401).json({
        status: 401,
        ok: false,
        msg: 'Token no valido',
      });
    }
    const { uid } = jwt.verify(token, process.env.JWT_KEY) as IPayload;
    req.uid = uid;
    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: 'Token no es valido',
    });
  }
};

export default validarJWTMiddleware;
