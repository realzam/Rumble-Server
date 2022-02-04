declare module 'http-errors' {
  export type CreateHttpError = {
    body: string;
    type: string;
  };
}
