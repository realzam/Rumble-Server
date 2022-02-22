import { Schema, Types } from 'mongoose';

export type Player = {
  nick: string;
  role: 'Host' | 'Player';
  sala: string;
  points: number;
  online: boolean;
  password: string;
};

export type PlayerInstance = Types.Subdocument<Types.ObjectId> & Player;

export const PlayerSchema = new Schema<Player>({
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
});

PlayerSchema.methods.toJSON = function toJSON(this: PlayerInstance) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { password, _id, ...ob } = this.toObject();
  const uid = (_id as Types.ObjectId).toString();
  return { ...ob, uid };
};
