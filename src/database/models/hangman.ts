import { Schema, Types } from 'mongoose';
import { Player } from './player';

export type StatusHangman = 'waitting word' | 'waitting letter' | 'stoped';

export interface Hangman {
  status: StatusHangman;
  letters: string[];
  lettersDisable: number[];
  secret: string[];
  turnWord: number;
  turnLetter: number;
  lifes: number;
  playerWord: string;
  playerLetter: string;
}
export type HangmanInstance = Types.Subdocument<Types.ObjectId> & Hangman;

export class HangmanClass {
  status: StatusHangman = 'waitting word';

  letters: string[] = [];

  lettersDisable: number[] = [];

  secret: string[] = [];

  turnWord = 0;

  turnLetter = 0;

  lifes = 7;

  playerWord = '';

  playerLetter = '';

  public setSecret(word: string) {
    const w = word
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/[^a-zA-Z ]/g, '')
      .trim()
      .toUpperCase();

    this.secret = w.split('');

    this.letters = w.replaceAll(/[A-Z]/g, '$').split('');
  }

  public nextWordPlayer(players: Types.DocumentArray<Player>) {
    let i = this.turnWord;
    do {
      if (i >= players.length) {
        i = 0;
      }
      // console.log('test', i);
      const player = players[i];
      i += 1;
      if (player.online) {
        this.turnLetter = i;
        this.playerWord = (player._id as Types.ObjectId).toString();
        return true;
      }
    } while (i !== this.turnWord);
    this.status = 'stoped';
    return false;
  }

  public nextLetterPlayer(players: Types.DocumentArray<Player>) {
    let i = this.turnLetter;
    do {
      if (i >= players.length) {
        i = 0;
      }
      // console.log('test', i);
      const player = players[i];
      i += 1;
      if (player.online) {
        const id = (player._id as Types.ObjectId).toString();
        if (id !== this.playerWord) {
          this.turnLetter = i;
          this.playerLetter = id;
          return true;
        }
      }
    } while (i !== this.turnLetter);
    this.status = 'stoped';
    return false;
  }
}

export const HangmanSchema = new Schema<Hangman>({
  letters: [String],
  lettersDisable: { type: [Number], default: [] },
  secret: [String],
  turnWord: { type: Number, default: 0 },
  turnLetter: { type: Number, default: 0 },
  lifes: { type: Number, default: 7 },
  playerWord: String,
  playerLetter: String,
  status: String,
});
