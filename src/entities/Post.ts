import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

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

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
