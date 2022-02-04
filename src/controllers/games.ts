import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import Sala from '../database/models/sala';
import { generarJWT } from '../helpers/jwt';

interface IbodyCrearSala {
  nick: string;
}

interface IbodyIngresarSala {
  nick: string;
  sala: string;
}

const crearSala = async (req: Request, res: Response) => {
  const { nick } = req.body as IbodyCrearSala;
  const id = nanoid(5);
  const sala = new Sala({ id, players: [nick] });
  await sala.save();
  const token = await generarJWT(id, 'Host', nick);
  res.json({
    ok: true,
    token,
  });
};

const ingresarSala = async (req: Request, res: Response) => {
  const { nick, sala } = req.body as IbodyIngresarSala;
  const s = await Sala.findOne({ id: sala });
  if (!s) {
    return res.status(400).json({
      ok: false,
      errors: [
        {
          value: sala,
          param: 'sala',
          location: 'body',
          msg: 'No existe la sala',
        },
      ],
    });
  }
  const existPlayer = s.playerExist(nick);
  if (existPlayer) {
    return res.status(400).json({
      ok: false,
      errors: [
        {
          value: nick,
          param: 'nick',
          location: 'body',
          msg: 'El nickname ya esta en la sala',
        },
      ],
    });
  }
  await s.agergarPlayer(nick);
  console.log(s.players);
  const token = await generarJWT(sala, 'Player', nick);
  return res.json({
    ok: true,
    token,
  });
};

export { crearSala, ingresarSala };
