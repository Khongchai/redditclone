import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

/* 
  From type-graphql:
  @Entity = it is now a model in a database.
  @ObjectType = It is now an object for TypeScript that we can use for our graphql query
  @Field = Properties decorated with this is now exposed to Graphql
  You can choose to not expose some fields to GraphQL by omitting @Field from the property.
*/

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ type: "text" })
  title!: string;
}
