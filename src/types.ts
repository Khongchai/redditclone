import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import { RedisClient } from "redis";

export type MyContext = {
  req: Request & { session: { userId: number } };
  redis: RedisClient;
  res: Response;
};
