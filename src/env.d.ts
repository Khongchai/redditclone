//global
declare namespace NodeJS {
  //this is the type of the ProcessEnv
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    SESSION_SECRET: string;
    CORS_ORIGIN: string;
  }
}
