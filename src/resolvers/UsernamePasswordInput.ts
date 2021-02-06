import { Field, InputType } from "type-graphql";

//Instead of creating multiple @Arg, this can be used instead.
//This is good because this class can be reused therefore very DRY.

@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}
