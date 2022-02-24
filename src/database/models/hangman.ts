import { Schema, Types } from 'mongoose';
import { Player } from './player';
import { isVowel } from '../../helpers/util';

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
  isFinish: boolean;
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

  isFinish = false;

  public reset() {
    this.status = 'waitting word';
    this.lettersDisable = [];
    this.letters = [];
    this.secret = [];
    this.turnLetter = 0;
    this.lifes = 7;
    this.playerWord = '';
    this.playerLetter = '';
    this.isFinish = false;
  }

  public setSecret(word: string) {
    const w = word
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/[^a-zA-Z ]/g, '')
      .trim()
      .toUpperCase();

    this.secret = w.split('');
    this.letters = w.replaceAll(/[A-Z]/g, '$').split('');
    this.isFinish = false;
  }

  public discoverdLetter(letter: string) {
    let points = 0;
    let add = 1;
    if (!isVowel(letter)) {
      add = 5;
    }
    for (let i = 0; i < this.secret.length; i += 1) {
      if (this.secret[i] === letter) {
        this.letters[i] = letter;
        points += add;
      }
    }
    if (points === 0) {
      points = -3;
      this.lifes -= 1;
    }
    console.log('discover try', this.letters, this.secret);
    console.log(
      'discover try chack',
      this.lifes === 0,
      this.letters.join('') === this.secret.join(''),
    );
    if (this.lifes === 0 || this.letters.join('') === this.secret.join('')) {
      console.log('discoverd finish');

      this.isFinish = true;
    }
    const code = letter.charCodeAt(0);
    this.lettersDisable.push(code);
    return points;
  }

  public nextWordPlayer(p: Types.DocumentArray<Player>) {
    const players = p.slice(0);
    let i = this.turnWord;
    do {
      const player = players[i];
      if (player.online) {
        this.turnWord = (i + 1) % players.length;
        this.playerWord = (player._id as Types.ObjectId).toString();
        return true;
      }
      i += 1;
      if (i >= players.length) {
        i = 0;
      }
    } while (i !== this.turnWord);
    this.status = 'stoped';
    return false;
  }

  public nextLetterPlayer(p: Types.DocumentArray<Player>) {
    const players = p.slice(0);
    let i = this.turnLetter;
    do {
      const player = players[i];
      if (player.online && player.id !== this.playerWord) {
        this.turnLetter = (i + 1) % players.length;
        this.playerLetter = (player._id as Types.ObjectId).toString();
        return true;
      }
      i += 1;
      if (i >= players.length) {
        i = 0;
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
  isFinish: { type: Boolean, default: false },
});
