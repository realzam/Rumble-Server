import * as sockio from 'socket.io';

const ahorcadoSokect = (socket: sockio.Socket): void => {
  console.log('cliente conectado a /ahorcado');
  socket.on('disconnect', async () => {
    console.log('Se desconecto el cliente', socket.id);
  });
};

export default ahorcadoSokect;
