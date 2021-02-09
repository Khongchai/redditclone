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

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "RedditCloneTypeORM",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: "http://localhost:3000",
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
      },
      saveUninitialized: false,
      secret: "lksf90s8dFUFowi4u03409923q$#%",
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
    context: ({ req, res }) => ({ req, res, redis: redisClient }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
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
