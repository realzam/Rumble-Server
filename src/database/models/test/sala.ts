import { Schema, model, Document, Types } from 'mongoose';
import { UsuarioSchema, IUsuario } from './usuarios';

export type ISala = {
  word: string;
  valor1: number;
  valor2: number;
  valor3: number;
  usuarios: Types.DocumentArray<IUsuario>;
};

export type Salainstance = Document<unknown, any, ISala> &
  ISala & {
    _id: Types.ObjectId;
  };

const SalaSchema = new Schema<ISala>({
  word: String,
  valor1: { type: Number, default: 0 },
  valor2: { type: Number, default: 0 },
  valor3: { type: Number, default: 0 },
  usuarios: [UsuarioSchema],
});

const SalaModelTest = model<ISala>('Sala', SalaSchema);
export default SalaModelTest;
