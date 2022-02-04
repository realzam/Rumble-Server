import { Schema, model, Document } from 'mongoose';

interface SalaDocument extends Document {
  id: string;
  players: string[];
  status: string;
  isAvalible: boolean;
  agergarPlayer(player: string): Promise<void>;
  playerExist(player: string): boolean;
  startGame(): Promise<void>;
}

const SalaSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  players: [String],

  isAvalible: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: 'in lobby',
  },
});

SalaSchema.methods.toJSON = function toJSON(this: SalaDocument) {
  delete this.__v;
  delete this._id;
  return this;
};

SalaSchema.methods.agergarPlayer = async function agergarPlayer(
  this: SalaDocument,
  player: string,
) {
  console.log('agergarPlayer');

  this.players.push(player);
  await this.save();
};

SalaSchema.methods.playerExist = function playerExist(
  this: SalaDocument,
  player: string,
) {
  return this.players.includes(player);
};

SalaSchema.methods.startGame = async function startGame(this: SalaDocument) {
  this.status = 'in game';
  await this.save();
};

const SalaModel = model<SalaDocument>('Sala', SalaSchema);
export default SalaModel;
