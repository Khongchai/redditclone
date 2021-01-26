import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[jt]s$/, // regex pattern for the migration files
  },
  entities: [Post, User],
  dbName: "redditclone",
  type: "postgresql",
  debug: !__prod__,
  username: "postgres",
  password: "postgres",
} as Parameters<typeof MikroORM.init>[0]; //Parameters returns an array so we take only the first one
