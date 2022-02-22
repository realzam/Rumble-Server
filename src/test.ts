import * as dotenv from 'dotenv';
import dbConnection from './database/config';
import RoomModel, { RoomInstance } from './database/models/room';
import { HangmanClass } from './database/models/hangman';

dotenv.config();

async function main() {
  console.log('hola test');
  dbConnection();
  const room = (await RoomModel.findById(
    '621438d500375e7557d1b752',
  )) as RoomInstance;
  console.log('Hola mundo', room.toObject().gameData);
  // const ha = Object.assign(new HangmanClass(), room.toObject().gameData);
  // ha.setSecret('Your Lie in April');
  // ha.lifes = 87;
  // ha.playerLetter = 'DEMACIA';
  const ha = new HangmanClass();
  room.gameData.set(ha);
  await room.save();
  console.log('Hola mundo', room.toObject().gameData);
  // console.log(han);
}

main();
