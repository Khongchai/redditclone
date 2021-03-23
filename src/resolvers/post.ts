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
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";

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

@Resolver(Post)
export class PostResolver {
  //FieldResolver is for when a field is purely calculable from other fields.
  //And FieldResovlers are returned only when called (can be called by any query/mutation in this resolver)
  //which is good. They only get called when they are needed.

  @FieldResolver(() => String)
  textSnippet(@Root() snippet: Post) {
    return snippet.text.slice(0, 20);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
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
      select p.* from post p 
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length > realLimit ? true : false,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    const requestedPost = await Post.findOne(id);
    return requestedPost;
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    //using query builder because we woudl to return the updated post; so the post should be get after the updation is done
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({
        title,
        text,
      })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id);
    if (!post) {
      return false;
    }
    if (post?.creatorId !== req.session.userId) {
      throw new Error("not authorized");
    }
    /*     //without cascade, you return like this, deleting each separately
    await Updoot.delete({ postId: id });
    await Post.delete({ id });
    return true; 

 */
    //with cascade, just call
    await Post.remove(post);

    return true;
  }
}
