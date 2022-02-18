import { Schema, model, Types, Model, Document } from 'mongoose';

interface HangmanFunc {
  initLetters(): Promise<void>;
  discoverLetter(letter: string): Promise<number>;
  setSecret(secret: string): Promise<void>;
}

export type Hangman = HangmanFunc & {
  letters: string[];
  lettersDisable: number[];
  secret: string[];
  turnWord: number;
  turnLetter: number;
  playerOrder: [Types.ObjectId];
  vidas: number;
  playerWord: string;
  playerLetter: string;
};

export type HangmanDocument = Hangman & Document;

const HangmanSchema = new Schema<Hangman, Model<Hangman>, HangmanFunc>({
  letters: [String],
  lettersDisable: { type: [Number], default: [] },
  secret: [String],
  turnWord: { type: Number, default: 0 },
  turnLetter: { type: Number, default: 0 },
  vidas: { type: Number, default: 7 },
  playerWord: String,
  playerLetter: String,
});

HangmanSchema.methods.initLetters = async function initLetters(
  this: HangmanDocument,
) {
  const letters: string[] = this.secret
    .join('')
    .replaceAll(/[A-Z]/g, '$')
    .split('');
  this.letters = letters;
  await this.save();
};

HangmanSchema.methods.setSecret = async function setScret(
  this: HangmanDocument,
  secret: string,
) {
  const w = secret
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/[^a-zA-Z ]/g, '')
    .trim()
    .toUpperCase()
    .split('');

  this.secret = w;
  await this.save();
  this.initLetters();
};

HangmanSchema.methods.discoverLetter = async function discoverLetter(
  this: HangmanDocument,
  letter: string,
) {
  let points = 0;
  let addPoints = 0;
  const vocals = letter.match(/[AUIOU]/g);
  if (vocals !== null && vocals.length > 0) {
    addPoints = 1;
  } else {
    addPoints = 5;
  }
  for (let i = 0; i < this.secret.length; i += 1) {
    const element = this.secret[i];
    if (element === letter) {
      this.letters[i] = element;
      points += addPoints;
    }
  }
  if (points === 0) {
    this.vidas -= 1;
  }
  if (this.vidas === 0) {
    this.letters = this.secret;
  }
  this.lettersDisable.push(letter.charCodeAt(0));
  await this.save();
  return points;
};

const HangmanModel = model<Hangman>('Hangman', HangmanSchema);

export default HangmanModel;
