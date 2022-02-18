declare module 'http-errors' {
  export type CreateHttpError = {
    body: string;
    type: string;
  };
}

declare namespace Express {
  export interface Request {
    token: string;
  }
}
