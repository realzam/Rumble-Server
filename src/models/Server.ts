import express from 'express';
import * as http from 'http';
import * as sockio from 'socket.io';
import * as path from 'path';
import cors from 'cors';
import Socket from './Socket';
import dbConnection from '../database/config';
import routerGame from '../router/games';
// import validarJson from '../middlewares/validar-json';
import errorHandleMiddleware from '../middlewares/error-handle';
import notFound from '../controllers/notFound';

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
      console.log(`Server correindo en puerto XD XD XD: ${this.port}`);
    });
    this.configurarSockets();
    dbConnection();
  }

  private middlewares() {
    this.app.use(express.static(path.resolve(__dirname, '..', 'public')));
    // CORS
    this.app.use(cors());
    // Parsebody
    this.app.use(express.json());
    this.app.use(errorHandleMiddleware);
    // this.app.use(express.urlencoded());
    // Routers
    this.app.use('/api/games', routerGame);
    // 404 Controller
    this.app.use(notFound);
  }

  private configurarSockets() {
    // eslint-disable-next-line no-new
    new Socket(this.io);
  }
}

export default Server;
