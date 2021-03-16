import { Request, Response } from "express";
import { RedisClient } from "redis";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  req: Request & { session: { userId: number } };
  redis: RedisClient;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
};
