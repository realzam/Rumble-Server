// declare global env variable to define types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_CNN_STRING: string;
      JWT_KEY: string;
    }
  }
}

export {};
