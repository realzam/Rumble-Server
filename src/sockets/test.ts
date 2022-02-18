import * as sockio from 'socket.io';
import { nanoid } from 'nanoid';
import UsuarioModelTest from '../database/models/test/usuarios';
import SalaModelTest from '../database/models/test/sala';

const testSocket = async (
  socket: sockio.Socket,
  io: sockio.Namespace,
): Promise<void> => {
  const usuario = new UsuarioModelTest({ nick: nanoid(5), puntos: 0 });
  usuario.save();
  const sala = await SalaModelTest.findById('620d8336e0613696df9221a0');
  socket.on('info', (data: string) => {
    console.log('info', data);
  });

  io.emit('yo', usuario.nick);
  io.emit('word', sala?.word);
};

export default testSocket;
