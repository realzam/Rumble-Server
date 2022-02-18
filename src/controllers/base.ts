import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { Request } from 'express';
import { comprobarJWT, generarJWT } from '../helpers/jwt';
import { getNameSpace } from '../helpers/util';
import { MyRequest, MyResponse } from '../types/types';
import PlayerModel from '../database/models/player';
import RoomModel from '../database/models/room';
import HangmanModel from '../database/models/hangman';

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
  const player = new PlayerModel({
    nick,
    role: 'Host',
    sala: id,
    password: hash,
  });
  await player.save();

  const hangmanData = new HangmanModel();
  await hangmanData.save();

  const sala = new RoomModel({
    id,
    players: [player._id],
    namespace,
    gameData: hangmanData._id,
  });
  await sala.save();

  const token = await generarJWT({
    nick,
    uid: player._id.toString(),
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
    const p = await s.getPlayerFromNick(nick);
    const okPassword = await bcrypt.compare(password, p.password);
    if (okPassword) {
      const token = await generarJWT({
        sala,
        nick,
        role: p.role,
        game: s.namespace,
        uid: p._id.toString(),
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
  const player = new PlayerModel({
    nick,
    role: 'player',
    sala: s.id,
    password: hash,
  });
  await player.save();
  await s.agregarPlayer(player._id, player.nick);

  const token = await generarJWT({
    sala,
    nick,
    role: 'Player',
    game: s.namespace,
    uid: player._id.toString(),
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
