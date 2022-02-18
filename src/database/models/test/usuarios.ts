import { Schema, model } from 'mongoose';

export type IUsuario = {
  nick: string;
  puntos: number;
};

const UsuarioSchema = new Schema<IUsuario>({
  nick: { type: String, required: true },
  puntos: Number,
});

const UsuarioModelTest = model<IUsuario>('Usuario', UsuarioSchema);
export default UsuarioModelTest;
