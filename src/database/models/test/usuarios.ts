import { Schema, model, Document, Types } from 'mongoose';

export type IUsuario = {
  nick: string;
  puntos: number;
  online: boolean;
};

export const UsuarioSchema = new Schema<IUsuario>({
  nick: { type: String, required: true },
  puntos: { type: Number, default: 500 },
  online: { type: Boolean, default: false },
});

export type UsuarioDoc = Types.Subdocument<Types.ObjectId> & IUsuario;

export type UsuarioInstance = Document<unknown, any, IUsuario> &
  IUsuario & {
    _id: Types.ObjectId;
  };

const UsuarioModelTest = model<IUsuario>('Usuario', UsuarioSchema);
export default UsuarioModelTest;
