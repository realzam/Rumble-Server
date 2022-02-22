/*
import * as sockio from 'socket.io';
import { comprobarJWT } from '../helpers/jwt';
import { JWTPayload } from '../types/types';
import RoomModel, { RoomInstance } from '../database/models/room';

import {
  emitCurrentStatus,
  emitPlayerList,
  getCurrentStatus,
  getNextTurn,
} from '../controllers/games/ahorcado';
import PlayerModel, { PlayerInstance } from '../database/models/player';
import HangmanModel, { HangmanDocument } from '../database/models/hangman';

const ahorcadoSokect = async (
  socket: sockio.Socket,
  io: sockio.Namespace,
): Promise<void> => {
  const tokenTemp = comprobarJWT(socket.handshake.query['x-token'] as string);

  if (!tokenTemp) {
    console.log('Sokect no identificado');
    socket.disconnect();
  }
  const { sala: salaID, role, uid } = tokenTemp as JWTPayload;
  const salaCheck = await RoomModel.findOne({ id: salaID });
  if (salaCheck === null) {
    socket.emit('finish_game');
    socket.disconnect();
  }
  const hangmanID = salaCheck?.gameData;
  socket.join(salaID);
  const player = (await PlayerModel.findById(uid)) as PlayerInstance;
  player.online = true;
  await player.save();
  socket.join(player.uid);

  await emitPlayerList(salaID, io);
  socket.emit('init_state', await getCurrentStatus(salaID));

  socket.on('start-game', async () => {
    if (role === 'Host') {
      const sala = (await RoomModel.findOne({ id: salaID })) as RoomInstance;
      sala.status = 'waitting word';
      const hangman = (await HangmanModel.findById(
        hangmanID,
      )) as HangmanDocument;
      const players = await sala.getPlayerList();
      const [uidWord, add] = await getNextTurn(players, hangman.turnWord);
      io.to(uidWord).emit('choose-word', uidWord);
      hangman.turnWord += add;
      hangman.playerWord = uidWord;
      const state = {
        estado: sala.status,
        players,
        letters: hangman.letters,
        lettersDisable: hangman.lettersDisable,
        vidas: hangman.vidas,
        segment: 7 - hangman.vidas,
        playerWord: uid,
      };
      io.to(salaID).emit('current-status', state);
      await hangman.save();
      await sala.save();
    }
  });

  socket.on('start-word', async (word) => {
    const sala = (await RoomModel.findOne({ id: salaID })) as RoomInstance;
    sala.startWordGame(word);
    io.to(salaID).emit('status-room', sala.status);
    await emitCurrentStatus(salaID, io);
  });

  socket.on('discover-letter', async (letter: string) => {
    const hangman = (await HangmanModel.findById(hangmanID)) as HangmanDocument;
    const points = await hangman.discoverLetter(letter);
    if (hangman.vidas === 0) {
      io.to(salaID).emit('game-over', await getCurrentStatus(salaID));
    } else {
      await player.agregarPuntos(points);
      await emitCurrentStatus(salaID, io);
      if (points === 0) {
        io.to(salaID).emit('error-discover-letter', 7 - hangman.vidas);
      }
    }
  });

  socket.on('disconnect', async () => {
    console.log('Se desconecto el cliente', uid);
    await PlayerModel.findByIdAndUpdate(uid, { online: false });
    await emitPlayerList(salaID, io);
  });
};

export default ahorcadoSokect;
*/
