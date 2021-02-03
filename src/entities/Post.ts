import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

/* 
  @Entity = it is now a model in a database.
  @ObjectType = It is now an object for TypeScript that we can use for our graphql query
  @Field = Properties decorated with this is now exposed to Graphql
  You can choose to not expose some fields to GraphQL by omitting @Field from the property.
*/

@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}
