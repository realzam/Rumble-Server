import * as sockio from 'socket.io';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/types';
import RoomModel, { RoomInstance } from '../database/models/room';
import { PlayerInstance, Player } from '../database/models/player';
import { StatusHangman, HangmanClass } from '../database/models/hangman';
// import { Hangman } from '../database/models/hangman';
import { delay } from '../helpers/util';

// type StatusRoom = Omit<Room, 'id' | 'isAvalible'>;

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

  socket.on('start_word', async (word) => {
    if (uid === room.gameData.playerWord) {
      const hangman = Object.assign(
        new HangmanClass(),
        room.toObject().gameData,
      );
      hangman.setSecret(word);
      hangman.nextLetterPlayer(room.players);
      room.gameData.set(hangman);
      await room.save();
      emitStateRoom();
      emitStateHangman();
    }
  });

  socket.on('discover-letter', async (letter: string) => {
    console.log('discover-letter', letter);
  });

  socket.on('disconnect', async () => {
    changeStream.close();
    room.players[pos].online = false;
    await room.save();
    console.log('disconnect');
    emitStateRoom();
  });
};

export default ahorcadoSokect;
