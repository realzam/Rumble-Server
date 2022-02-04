import { Schema, model, Document } from 'mongoose';

interface PlayerDocument extends Document {
  auth: string;
  nick: string;
  role: string;
}

const PlayerSchema = new Schema({
  auth: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },
  nick: {
    type: String,
    required: true,
  },
  online: {
    type: Boolean,
    default: false,
  },
});

PlayerSchema.methods.toJSON = function toJSON(this: PlayerDocument) {
  delete this.__v;
  delete this._id;
  return this;
};

const PlayerModel = model<PlayerDocument>('Player', PlayerSchema);
export default PlayerModel;
