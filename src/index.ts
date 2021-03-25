import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import redis from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/User";
import { createUserLoader } from "./utils/createUserLoader";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import "dotenv-safe/config";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    //synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });

  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient(process.env.REDIS_URL);
  //for nginx
  app.set("proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTTL: true,
      }),
      cookie: {
        httpOnly: true,
        secure: __prod__, // cookie only works in https
        sameSite: "lax",
        //look at this  if there is problem regarding passing the cookie
        //domain: __prod__ ? ".codeponder.com" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  //Initiate an apollo server with the following schema.
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    //Context is a special object that is accessible by all resolvers
    context: ({ req, res }) => ({
      req,
      res,
      redis: redisClient,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => console.error(err));

/*
removed before switching to TypeORM
  //connect to database
  const orm = await MikroORM.init(mikroConfig);

  //getMigrator().up() runs the migration after migration:create
  await orm.getMigrator().up();
 
 */

//basic create post stuff
//not needed anymore, this part is kept as a reference
//run sql
/* const post = orm.em.create(Post, { title: "my first post" });
  await orm.em.persistAndFlush(post); */

/*   const posts = await orm.em.find(Post, {});
  console.log(posts); */
