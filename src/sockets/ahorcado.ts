import * as sockio from 'socket.io';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/types';
import RoomModel, { RoomInstance } from '../database/models/room';
import { PlayerInstance, Player } from '../database/models/player';
import { StatusHangman, HangmanClass } from '../database/models/hangman';
import { delay } from '../helpers/util';

type SocketStatusRoom = {
  players: Types.DocumentArray<Player>;
  status: 'In lobby';
};

type SocketStatusHangman = {
  letters: string[];
  lettersDisable: number[];
  lifes: number;
  status: StatusHangman;
  playerWord: string;
  playerLetter: string;
};

const ahorcadoSokect = async (
  socket: sockio.Socket,
  io: sockio.Namespace,
): Promise<void> => {
  const tokenString = socket.handshake.query['x-token'] as string;
  const { sala: roomID, uid, role } = jwt.decode(tokenString) as JWTPayload;

  let room = (await RoomModel.findOne({ id: roomID })) as RoomInstance;
  const roomMongoID = (room._id as Types.ObjectId).toString();
  const player = room.players.id(uid) as PlayerInstance;
  const pos = room.players.indexOf(player);
  const emitStateRoom = () => {
    io.to(roomID).emit('status_room', {
      status: room.status,
      players: room.players,
    } as SocketStatusRoom);
  };
  const emitStateHangman = () => {
    const h = room.gameData;
    const playerWord = room.players.id(h.playerWord)?.nick || '';
    const playerLetter = room.players.id(h.playerLetter)?.nick || '';
    io.to(roomID).emit('status_hangman', {
      letters: h.letters,
      lettersDisable: h.lettersDisable,
      lifes: h.lifes,
      status: h.status,
      playerWord,
      playerLetter,
    } as SocketStatusHangman);
  };

  const changeStream = RoomModel.watch();

  socket.join(roomID);
  socket.join(uid);
  room.players[pos].online = true;
  await room.save();

  changeStream.on('change', async (change) => {
    const id = (change.documentKey as unknown as { _id: Types.ObjectId })._id;
    const idMongo = (id as Types.ObjectId).toString();
    if (idMongo === roomMongoID) {
      console.log('room changeStream');
      room = (await RoomModel.findById(roomMongoID)) as RoomInstance;
    }
  });

  emitStateRoom();
  if (room.status === 'In game') {
    emitStateHangman();
  }
  await delay(300);
  socket.emit('init');
  if (room.gameData.playerWord === uid) {
    socket.emit('input_word');
  }

  socket.on('start_game', async () => {
    if (role === 'Host') {
      room.status = 'In game';
      const hangman = Object.assign(
        new HangmanClass(),
        room.toObject().gameData,
      );
      hangman.status = 'waitting word';
      const anyOnline = hangman.nextWordPlayer(room.players);
      room.gameData.set(hangman);
      await room.save();
      emitStateRoom();
      emitStateHangman();
      if (anyOnline) {
        io.to(hangman.playerWord).emit('input_word');
      }
    }
  });

  socket.on('start_word', async (word: string) => {
    console.log('start_word', uid, room.gameData.playerWord);
    const code = word.charCodeAt(0);
    const exist = room.gameData.lettersDisable.includes(code);
    if (uid === room.gameData.playerWord && !exist) {
      const hangman = Object.assign(
        new HangmanClass(),
        room.toObject().gameData,
      );
      hangman.setSecret(word);
      const anyOnline = hangman.nextLetterPlayer(room.players);
      if (anyOnline) {
        hangman.status = 'waitting letter';
      }
      room.gameData.set(hangman);
      await room.save();
      emitStateRoom();
      emitStateHangman();
    }
  });

  socket.on('discover-letter', async (letter: string) => {
    console.log('discover-letter', letter);
    if (uid === room.gameData.playerLetter) {
      const hangman = Object.assign(
        new HangmanClass(),
        room.toObject().gameData,
      );
      const puntos = hangman.discoverdLetter(letter);
      room.players[pos].points += puntos;

      if (hangman.isFinish) {
        if (hangman.lifes === 0) {
          io.to(roomID)
            .except(hangman.playerWord)
            .emit('game_over', hangman.secret.join(''));
          io.to(roomID)
            .except(hangman.playerWord)
            .emit('sound_game_over', hangman.secret.join(''));
          io.to(hangman.playerWord).emit('winning_game');
          io.to(hangman.playerWord).emit('sound_winning_game');
        } else {
          io.to(roomID)
            .except(hangman.playerWord)
            .emit('winning_game', hangman.secret.join(''));
          io.to(roomID)
            .except(hangman.playerWord)
            .emit('sound_winning_game', hangman.secret.join(''));

          io.to(hangman.playerWord).emit('game_over');
          io.to(hangman.playerWord).emit('sound_game_over');
        }

        hangman.letters = hangman.secret;
        room.gameData.set(hangman);
        await room.save();
        emitStateRoom();
        emitStateHangman();
        setTimeout(async () => {
          hangman.reset();
          hangman.nextWordPlayer(room.players);
          room.gameData.set(hangman);
          await room.save();
          console.log('RESET ROOM', hangman);
          emitStateRoom();
          emitStateHangman();
          io.to(hangman.playerWord).emit('input_word');
        }, 8000);
      } else {
        hangman.nextLetterPlayer(room.players);
        if (puntos === -3) {
          io.to(roomID).emit('sound_error_letter');
        } else {
          io.to(roomID).emit('sound_correct_letter');
        }
        room.gameData.set(hangman);
        await room.save();
        emitStateRoom();
        emitStateHangman();
      }
    }
  });

  socket.on('disconnect', async () => {
    changeStream.close();
    room.players[pos].online = false;
    if (room.status === 'In game') {
      const hangman = Object.assign(
        new HangmanClass(),
        room.toObject().gameData,
      );
      if (hangman.status === 'waitting word' && hangman.playerWord === uid) {
        hangman.nextWordPlayer(room.players);
      }
      if (
        // eslint-disable-next-line operator-linebreak
        hangman.status === 'waitting letter' &&
        hangman.playerLetter === uid
      ) {
        hangman.nextLetterPlayer(room.players);
      }
      room.gameData.set(hangman);
    }
    await room.save();
    emitStateRoom();
    emitStateHangman();
    console.log('disconnect');
  });
};

export default ahorcadoSokect;
