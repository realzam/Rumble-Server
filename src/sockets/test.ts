import { Types } from 'mongoose';
import * as sockio from 'socket.io';
import SalaModelTest, { Salainstance } from '../database/models/test/sala';
import { UsuarioDoc } from '../database/models/test/usuarios';
// import { IUsuario } from '../database/models/test/usuarios';

const testSocket = async (
  socket: sockio.Socket,
  io: sockio.Namespace,
): Promise<void> => {
  const changeStream = SalaModelTest.watch(undefined, {
    fullDocument: 'updateLookup',
  });
  const salaID = '62129e256f211a414ab1b80c';

  const id = socket.handshake.query.id as string;
  let sala = (await SalaModelTest.findById(salaID)) as Salainstance;

  const usuario = sala.usuarios.id(id) as UsuarioDoc;
  const pos = sala.usuarios.indexOf(usuario);
  sala.usuarios[pos].online = true;
  const emitSalaSate = () => {
    console.log('emitSalaSate from', usuario.nick);
    io.emit('sala_state', {
      word: sala.word,
      valor1: sala.valor1,
      valor2: sala.valor2,
      valor3: sala.valor3,
      usuarios: sala.usuarios,
    });
  };

  changeStream.on('change', async (change) => {
    const dok = change.documentKey as unknown as { _id: Types.ObjectId };
    if (dok._id.toString() === salaID) {
      sala = (await SalaModelTest.findById(salaID)) as Salainstance;
    }
  });
  socket.on('mod_word', async (word: string) => {
    sala.word = word;
    await sala.save();
    emitSalaSate();
  });

  socket.on('mod_valor1', async (valor: number) => {
    sala.valor1 = valor;
    await sala.save();
    emitSalaSate();
  });

  socket.on('mod_valor2', async (valor: number) => {
    sala.valor2 = valor;
    await sala.save();
    emitSalaSate();
  });

  socket.on('mod_valor3', async (valor: number) => {
    sala.valor3 = valor;
    await sala.save();
    emitSalaSate();
  });

  socket.on('disconnect', async () => {
    changeStream.close();
    sala.usuarios[pos].online = false;
    await sala.save();
    console.log('disconnect', sala);
    emitSalaSate();
  });

  io.emit('yo', { nick: usuario.nick, puntos: usuario.puntos });
  emitSalaSate();
};

export default testSocket;
