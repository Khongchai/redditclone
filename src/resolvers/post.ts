import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

//resolver queries for whatever you have in your entities.
//Query = for getting data
//Mutation is for, well, everything else that requires the manipulation of data
//This is Django's view equivalent

@Resolver()
export class PostResolver {
  //() => [Post] means this query returns an object of type "Post", which is a graphql type
  @Query(() => [Post])
  //The :Promise<Post[]> type is a typescript type
  async posts(): Promise<Post[]> {
    //await sleep_seconds(3);
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post | null> {
    return Post.create({ title }).save();
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
