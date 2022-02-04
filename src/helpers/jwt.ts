import jwt from 'jsonwebtoken';

interface IPayload {
  uid: string;
  role: string;
  nick: string;
}

const generarJWT = (
  sala: string,
  role: string,
  nick: string,
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const payload = { sala, role, nick };
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

const comprobarJWT = (token = ''): [boolean, string] => {
  try {
    const { uid } = jwt.verify(token, process.env.JWT_KEY) as IPayload;
    return [true, uid];
  } catch (error) {
    return [false, ''];
  }
};

export { generarJWT, comprobarJWT };
