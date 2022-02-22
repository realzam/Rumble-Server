import { Schema, model, Types, Document, Model } from 'mongoose';
import { Games } from '../../types/types';
import { HangmanInstance, HangmanSchema } from './hangman';
import { Player, PlayerInstance, PlayerSchema } from './player';

interface RoomFunctions {
  playerExist(nick: string): boolean;
  getPlayerByNick(nick: string): PlayerInstance | undefined;
}

export type Room = RoomFunctions & {
  id: string;
  players: Types.DocumentArray<Player>;
  status: 'In game' | 'In lobby';
  isAvalible: boolean;
  gameData: HangmanInstance;
  namespace: Games;
};

export type RoomInstance = Room & Document;

const RoomSchema = new Schema<
  Room,
  Model<Room, any, RoomFunctions>,
  RoomFunctions
>(
  {
    id: {
      type: String,
      required: true,
    },
    players: [PlayerSchema],
    gameData: HangmanSchema,
    isAvalible: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: 'In lobby',
    },
    namespace: { type: String },
  },
  { versionKey: false },
);

RoomSchema.methods.playerExist = function playerExist(
  this: RoomInstance,
  nick: string,
) {
  return this.players.find((p) => p.nick === nick) !== undefined;
};

RoomSchema.methods.getPlayerByNick = function getPlayerByNick(
  this: RoomInstance,
  nick: string,
) {
  return this.players.find((p) => p.nick === nick);
};

const RoomModel = model<Room>('Room', RoomSchema);

export default RoomModel;
