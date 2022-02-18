import { Schema, model, Document, Model } from 'mongoose';

interface PlayerFunctions {
  agregarPuntos(points: number): Promise<void>;
  toJSON(): PlayerInstance;
}
export type Player = {
  nick: string;
  role: string;
  sala: string;
  points: number;
  online: boolean;
  uid: string;
};

type IPlayer = Player &
  PlayerFunctions & {
    password: string;
  };

export type PlayerInstance = Player &
  PlayerFunctions &
  Document & {
    password: string;
  };

const PlayerSchema = new Schema<
  IPlayer,
  Model<IPlayer, any, PlayerFunctions>,
  PlayerFunctions
>(
  {
    password: String,
    sala: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    online: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
    },
    nick: {
      type: String,
      required: true,
    },
  },
  { versionKey: false },
);

PlayerSchema.methods.toJSON = function toJSON(this: PlayerInstance) {
  this.uid = this._id.toString();
  delete this.__v;
  return this;
};

PlayerSchema.methods.agregarPuntos = async function agregarPuntos(
  this: PlayerInstance,
  points: number,
) {
  this.points += points;
  await this.save();
};

const PlayerModel = model<IPlayer>('Player', PlayerSchema);
export default PlayerModel;
