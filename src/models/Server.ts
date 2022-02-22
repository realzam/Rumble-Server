import express from 'express';
import * as http from 'http';
import * as sockio from 'socket.io';
import cors from 'cors';
import dbConnection from '../database/config';
import routerBase from '../router/base';
import errorHandleMiddleware from '../middlewares/error-handle';
import notFound from '../controllers/notFound';
import ahorcadoSokect from '../sockets/ahorcado';
import { comprobarJWT } from '../helpers/jwt';

class Server {
  private app = express();

  private port = process.env.PORT;

  private server = http.createServer(this.app);

  private io = new sockio.Server(this.server, {
    cors: {
      origin: '*',
    },
  });

  public execute() {
    this.middlewares();
    this.server.listen(this.port, () => {
      console.log(`Server correindo en puerto: ${this.port}`);
    });
    this.configurarSockets();
    dbConnection();
  }

  private middlewares() {
    // CORS
    this.app.use(cors());
    // Parsebody
    this.app.use(express.json());
    this.app.use(errorHandleMiddleware);
    // this.app.use(express.urlencoded());
    // Routers
    this.app.use('/api', routerBase);
    // 404 Controller
    this.app.use(notFound);
  }

  private configurarSockets() {
    const ahorcado = this.io.of('/ahorcado');
    ahorcado.use((socket, next) => {
      const token = comprobarJWT(socket.handshake.query['x-token'] as string);
      if (!token) {
        console.log('Sokect no identificado');
        socket.disconnect();
      }
      next();
    });

    ahorcado.on('connection', (socket: sockio.Socket) => {
      ahorcadoSokect(socket, ahorcado);
    });
  }
}

export default Server;
