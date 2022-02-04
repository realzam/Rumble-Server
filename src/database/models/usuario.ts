import { Schema, model, Document } from 'mongoose';

interface UsuarioDocument extends Document {
  email: string;
  nombre: string;
  password: string;
  online: boolean;
  uid: string;
}

const UsuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  online: {
    type: Boolean,
    default: false,
  },
});

UsuarioSchema.methods.toJSON = function toJSON(this: UsuarioDocument) {
  const { password, ...obj } = this.toObject() as UsuarioDocument;
  obj.uid = obj._id;
  delete obj.__v;
  delete obj._id;
  return obj;
};

const UsuarioModel = model<UsuarioDocument>('Usuario', UsuarioSchema);
export default UsuarioModel;
