import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

//wrap this around any resolver that needs authentication
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }

  return next();
};
