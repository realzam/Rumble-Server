import * as sockio from 'socket.io';
import HangmanModel, { HangmanDocument } from '../../database/models/hangman';
import { Player } from '../../database/models/player';
import RoomModel, { RoomInstance } from '../../database/models/room';

interface SocketInitState {
  estado: string;
  players: Player[];
  letters: string[];
  lettersDisable: number[];
  vidas: number;
  segment: number;
}
export const getNextTurn = async (
  players: Player[],
  turn: number,
): Promise<[string, number]> => {
  for (let i = 0; i < turn; i += 1) {
    players.push(players.shift() as Player);
  }
  for (let i = 0; i < players.length; i += 1) {
    const player = players[i];
    if (player.online) {
      return [player.uid, i + 1];
    }
  }
  return ['', 0];
};

/*
  [a,b,c,d,e] i=0
*/
export const getCurrentStatus = async (
  salaID: string,
): Promise<SocketInitState> => {
  const sala = (await RoomModel.findOne({ id: salaID })) as RoomInstance;
  const hangman = (await HangmanModel.findById(
    sala.gameData,
  )) as HangmanDocument;
  const players = await sala.getPlayerListInfo();
  return {
    estado: sala.status,
    players,
    letters: hangman.letters,
    lettersDisable: hangman.lettersDisable,
    vidas: hangman.vidas,
    segment: 7 - hangman.vidas,
  };
};

export const emitPlayerList = async (salaID: string, io: sockio.Namespace) => {
  const sala = (await RoomModel.findOne({ id: salaID })) as RoomInstance;
  io.emit('player_list', await sala.getPlayerListInfo());
};

export const emitCurrentStatus = async (
  salaID: string,
  io: sockio.Namespace,
) => {
  io.to(salaID).emit('current-status', await getCurrentStatus(salaID));
};
