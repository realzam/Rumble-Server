import * as sockio from 'socket.io';
import {
  getUsuarios,
  grabarMensaje,
  usuarioConectado,
  usuarioDesconectado,
} from '../controllers/sockets';
import { comprobarJWT } from '../helpers/jwt';
import ahorcadoSokect from '../sockets/ahorcado';
import { IMessagepayload } from '../types/socket';

class Socket {
  public constructor(private io: sockio.Server) {
    this.socketEvents();
  }

  private socketEvents() {
    this.io.of('/ahorcado').on('connection', ahorcadoSokect);
    this.io.on('connection', async (socket) => {
      const [valido, uid] = comprobarJWT(
        socket.handshake.query['x-token'] as string,
      );

      // TODO: Validar el JWT
      // Si el token no es valido, desconectar
      if (!valido) {
        console.log('Sokect no identificado');
        socket.disconnect();
      }
      await usuarioConectado(uid);
      // Unir al usuario a una sala de socket.io
      socket.join(uid);

      console.log('cliente conectado', uid);

      // TODO: Saber que usuario está activo mediante el UID

      // TODO: Emitir todos los usuarios conectados
      this.io.emit('lista-usuarios', await getUsuarios());

      // TODO: Socket join to room

      // TODO: Escuhar cuando el cliente manda un mensaje
      // mensaje-personal
      socket.on('mensaje-personal', async (payload: IMessagepayload) => {
        const mensaje = await grabarMensaje(payload, uid);
        if (mensaje !== null) {
          console.log('token:', socket.handshake.query['x-token'] as string);
          this.io.to(payload.para).emit('mensaje-personal', mensaje);
          this.io.to(uid).emit('mensaje-personal', mensaje);
        }
      });

      // TODO: Disconnect
      // Marcar en la BD que el usuario se deconecto
      socket.on('disconnect', async () => {
        await usuarioDesconectado(uid);
        this.io.emit('lista-usuarios', await getUsuarios());
        console.log('Se desconecto el cliente', uid);
      });
    });
  }
}

export default Socket;
