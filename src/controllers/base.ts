import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Request } from 'express';
import { comprobarJWT, generarJWT } from '../helpers/jwt';
import { getNameSpace } from '../helpers/util';
import { MyRequest, MyResponse } from '../types/types';
import RoomModel from '../database/models/room';
import { PlayerInstance } from '../database/models/player';
import { HangmanClass, HangmanInstance } from '../database/models/hangman';

interface IbodyCrearSala {
  nick: string;
  game: number;
  password: string;
}

interface IbodyIngresarSala {
  nick: string;
  sala: string;
  password: string;
}

const crearSala = async (req: MyRequest<IbodyCrearSala>, res: MyResponse) => {
  const { nick, game, password } = req.body;
  const id = nanoid(5);
  const namespace = getNameSpace(game);
  if (!namespace) {
    return res.json({
      ok: false,
      error: `No existe el juego con ID:${id}`,
    });
  }
  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(password, salt);
  const player = {
    nick,
    role: 'Host',
    sala: id,
    password: hash,
  };

  const sala = new RoomModel({
    id,
    namespace,
  });
  sala.players.push(player);
  const h = new HangmanClass();
  sala.gameData = {} as HangmanInstance;
  sala.gameData.set(h);
  await sala.save();
  const uid = sala.players[0]._id as Types.ObjectId;

  const token = await generarJWT({
    nick,
    uid: uid.toString(),
    game: namespace,
    role: 'Host',
    sala: id,
  });
  return res.json({
    ok: true,
    token,
  });
};

const ingresarSala = async (
  req: MyRequest<IbodyIngresarSala>,
  res: MyResponse,
) => {
  const { nick, sala, password } = req.body;
  const s = await RoomModel.findOne({ id: sala });
  if (!s) {
    return res.status(400).json({
      ok: false,
      error: 'No existe la sala',
    });
  }
  const existPlayer = await s.playerExist(nick);

  if (existPlayer) {
    const p = s.getPlayerByNick(nick) as PlayerInstance;
    const uid = p._id as Types.ObjectId;
    const okPassword = await bcrypt.compare(password, p.password);
    if (okPassword) {
      const token = await generarJWT({
        sala,
        nick,
        role: p.role,
        game: s.namespace,
        uid: uid.toString(),
      });
      return res.json({
        ok: true,
        token,
      });
    }

    return res.status(400).json({
      ok: false,
      error: 'El nickname ya esta en la sala',
    });
  }

  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(password, salt);
  const player = {
    nick,
    role: 'Player',
    sala: s.id,
    password: hash,
  };

  const pos = s.players.push(player) - 1;
  await s.save();

  const uid = s.players[pos]._id as Types.ObjectId;

  const token = await generarJWT({
    sala,
    nick,
    role: 'Player',
    game: s.namespace,
    uid: uid.toString(),
  });
  return res.json({
    ok: true,
    token,
  });
};

const renewToken = async (req: Request, res: MyResponse) => {
  try {
    let { token } = req;
    // Generar new JWT
    const tokenObj = comprobarJWT(token);
    if (tokenObj === null) {
      return res.status(500).json({
        ok: false,
        error: 'Internal Server Error, :(',
      });
    }

    const s = await RoomModel.findOne({ id: tokenObj.sala });
    if (!s) {
      return res.status(400).json({
        ok: false,
        error: 'No existe la sala',
      });
    }
    token = await generarJWT({
      game: tokenObj.game,
      nick: tokenObj.nick,
      role: tokenObj.role,
      sala: tokenObj.sala,
      uid: tokenObj.uid,
    });
    return res.json({
      ok: true,
      token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      ok: false,
      error: 'Internal Server Error, :(',
    });
  }
};

export { crearSala, ingresarSala, renewToken };
