import { Schema, model } from 'mongoose';

interface MensajeDocument extends Document {
  de: string;
  para: string;
  mensaje: string;
  createdAt: string;
  updatedAt: string;
}

const MensajeSchema = new Schema(
  {
    de: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    para: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// UsuarioSchema.method('toJson', function () {
//   const { __v, _id, password, ...object } = this.toObject();
//   object.uid=_id;
//   return object;
// });

export default model<MensajeDocument>('Mensaje', MensajeSchema);
