import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/User";

const main = async () => {
  //connect to database
  const orm = await MikroORM.init(mikroConfig);
  //getMigrator().up() runs the migration after migration:create
  await orm.getMigrator().up();

  const app = express();
  //Initiate an apollo server with the following schema.
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    //Context is a special object that is accessible by all resolvers
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => console.error(err));

//basic create post stuff
//not needed anymore, this part is kept as a reference
//run sql
/* const post = orm.em.create(Post, { title: "my first post" });
  await orm.em.persistAndFlush(post); */

/*   const posts = await orm.em.find(Post, {});
  console.log(posts); */
