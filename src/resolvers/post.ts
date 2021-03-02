import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

//resolver queries for whatever you have in your entities.
//Query = for getting data
//Mutation is for, well, everything else that requires the manipulation of data
//This is Django's view equivalent

@Resolver(Post)
export class PostResolver {
  //FieldResolver is for when a field is purely calculable from other fields.
  @FieldResolver(() => String)
  textSnippet(@Root() snippet: Post) {
    return snippet.text.slice(0, 20);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    //the user has voted on this post before
    //and the y are cahnging their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `update updoot 
          set value = $1
          where "postId" = $2 and "userId" = $3`,
          [realValue, postId, userId]
        );
        //times two because not only do we have to take nullify the previous point,
        //we'd also have to add or subtract one point
        await tm.query(
          `update post
          set points = points + $1
          where id = $2`,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      //has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `insert into updoot ("userId", "postId", value)
          values ($1,$2,$3);`,
          [userId, postId, realValue]
        );
        await tm.query(
          `update post
          set points = points + $1
          where id = $2`,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  //() => [Post] means this query returns an object of type "Post", which is a graphql type
  //Using a query builder and create your own query allows you to use conditions with SQL queries
  //Below, only get cursor if it is passed in
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    //instead of fetching n posts, fetch n + 1; easy to validate if there is anymore left
    //we'll slice in the return statement to the original n.
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object('username', u.username, 
      'id', u.id, 'email', 
      u.email) creator
      from post p 
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    /*  const querybuilder = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .innerJoinAndSelect("p.creator", "u", "u.id = 'p.creatorId'")
      .orderBy('p."createdAt"', "DESC")
      .take(realLimitPlusOne);

        if (cursor) {
      querybuilder.where('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await querybuilder.getMany(); */

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length > realLimit ? true : false,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      //Update post of id "id" with title "title".
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
