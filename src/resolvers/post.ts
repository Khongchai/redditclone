import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

//resolver queries for whatever you have in your entities.
//Query = for getting data
//Mutation is for, well, everything else that requires the manipulation of data
//This is Django's view equivalent

@Resolver()
export class PostResolver {
  //() => [Post] means this query returns an object of type "Post", which is a graphql type
  @Query(() => [Post])
  //The :Promise<Post[]> type is a typescript type
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    //await sleep_seconds(3);
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    const postToBeDeleted = await em.findOne(Post, { id });
    if (!postToBeDeleted) {
      return false;
    } else {
      await em.nativeDelete(Post, { id });
      return true;
    }
  }
}
