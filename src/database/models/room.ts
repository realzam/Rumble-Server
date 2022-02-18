import { Schema, model, Types, Model, Document } from 'mongoose';
import HangmanModel from './hangman';
import PlayerModel, { Player, PlayerInstance } from './player';

interface RoomFunctions {
  agregarPlayer(playerID: Types.ObjectId, nick: string): Promise<void>;
  eliminarPlayer(player: string): Promise<void>;
  playerExist(player: string): Promise<boolean>;
  startGame(): Promise<void>;
  startWordGame(word: string): Promise<void>;
  getPlayerList(): Promise<PlayerInstance[]>;
  getPlayerListInfo(): Promise<Player[]>;
  getPlayerFromNick(nick: string): Promise<PlayerInstance>;
}

type Room = RoomFunctions & {
  id: string;
  players: Types.ObjectId[];
  status: string;
  isAvalible: boolean;
  namespace: string;
  gameData: Types.ObjectId;
};

export type RoomInstance = Room & Document;

const RoomSchema = new Schema<
  Room,
  Model<Room, any, RoomFunctions>,
  RoomFunctions
>({
  id: {
    type: String,
    required: true,
  },
  players: {
    type: [Types.ObjectId],
    ref: 'Player',
    unique: true,
  },
  namespace: {
    type: String,
    required: true,
  },
  gameData: { type: Types.ObjectId, required: true },
  isAvalible: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: 'in lobby',
  },
});

RoomSchema.methods.agregarPlayer = async function agergarPlayer(
  this: RoomInstance,
  playerID: Types.ObjectId,
  nick: string,
) {
  if (!(await this.playerExist(nick))) {
    this.players.push(playerID);
    await this.save();
  }
};

RoomSchema.methods.getPlayerFromNick = async function getPlayerFromNick(
  this: RoomInstance,
  nick: string,
) {
  const players = await this.getPlayerList();
  const player = players.find((p) => p.nick === nick);
  return player as PlayerInstance;
};
RoomSchema.methods.playerExist = async function playerExist(
  this: RoomInstance,
  nick: string,
) {
  const players = await this.getPlayerList();
  const player = players.find((p) => p.nick === nick);
  return player !== undefined;
};

RoomSchema.methods.getPlayerList = async function playersList(
  this: RoomInstance,
) {
  const result = (await Promise.all(
    this.players.map((id) => PlayerModel.findById(id)),
  )) as PlayerInstance[];
  return result;
};

function sortByPoints(a: Player, b: Player) {
  if (a.points > b.points) {
    return -1;
  }
  if (a.points < b.points) {
    return 1;
  }
  return 0;
}

RoomSchema.methods.getPlayerListInfo = async function getPlayerListInfo(
  this: RoomInstance,
) {
  const players = await this.getPlayerList();
  let result: Player[] = players.map((p) => ({
    nick: p.nick,
    online: p.online,
    points: p.points,
    role: p.role,
    sala: p.sala,
    uid: p._id.toString(),
  }));
  result = result.sort(sortByPoints);
  return result;
};

RoomSchema.methods.startGame = async function startGame(this: RoomInstance) {
  this.status = 'waitting word';
  await this.save();
};

RoomSchema.methods.startWordGame = async function startGame(
  this: RoomInstance,
  word: string,
) {
  const h = await HangmanModel.findById(this.gameData);
  await h?.setSecret(word);
  this.status = 'in game';
  await this.save();
};

const RoomModel = model<Room>('Room', RoomSchema);

export default RoomModel;
