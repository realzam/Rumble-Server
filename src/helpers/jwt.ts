import jwt from 'jsonwebtoken';
import { JWTPayloadArgs, JWTPayload } from '../types/types';

const generarJWT = (payload: JWTPayloadArgs): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_KEY,
      {
        expiresIn: '6h',
      },
      (err, token) => {
        if (err || !token) {
          console.log(err);
          reject(new Error('No se pudo generar el JWT'));
        }
        resolve(<string>token);
      },
    );
  });
};

const comprobarJWT = (
  token: string,
  options?: jwt.VerifyOptions & {
    complete?: false | undefined;
  },
): JWTPayload | null => {
  try {
    const tokenVal = jwt.verify(
      token,
      process.env.JWT_KEY,
      options,
    ) as JWTPayload;
    return tokenVal;
  } catch (error) {
    console.log('comprobarJWT', error);
    return null;
  }
};

export { generarJWT, comprobarJWT };
