import { Schema, model } from 'mongoose';

export type ISala = {
  word: string;
};

const UsuarioSchema = new Schema<ISala>({
  word: String,
});

const SalaModelTest = model<ISala>('Sala', UsuarioSchema);
export default SalaModelTest;
