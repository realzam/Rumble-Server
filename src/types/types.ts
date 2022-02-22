import express from 'express';
import { Send } from 'express-serve-static-core';

type ErrorJson = {
  ok: false;
  error: string;
};

type OKJson = {
  ok: true;
  token: string;
};

export interface MyRequest<T> extends express.Request {
  body: T;
}

export interface ErrorResponse extends express.Response {
  json: Send<ErrorJson, this>;
}

export interface OKResponse extends express.Response {
  json: Send<OKJson, this>;
}

export interface MyResponse extends express.Response {
  json: Send<OKJson | ErrorJson, this>;
}

export interface JWTPayload {
  uid: string;
  sala: string;
  role: 'Host' | 'Player';
  nick: string;
  game: string;
  iat: number;
  exp: number;
}

export type Games = 'Hangman';

export type JWTPayloadArgs = Omit<JWTPayload, 'iat' | 'exp'>;
