import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  hello() {
    return "hello world";
  }

  @Query(() => String)
  howAreYou() {
    return "How are you?";
  }
}
