import argon2 from "argon2";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";
import { promisify } from "util";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

//ObjectType we return from mutations//queries
//Input type we return from arguments
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  //Field resolver resolves just a field
  //For example, this one resolves the the field "email" of the User entity.
  //If the field being resolved does not exist, a new one will be exposed to GraphQL
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //this is the current user and it's ok to show them their email.
    if (req.session.userId === user.id) {
      return user.email;
    }
    //current user wants to see someone else's email
    return "";
  }
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    //This should be refactored; this logic is already stated in the validateRegsiter.ts file.
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            //name of field on the front end.
            field: "newPassword",
            message: "password must be longer than 3 characters",
          },
        ],
      };
    }

    const getAsync = promisify(redis.get).bind(redis);
    const key = FORGET_PASSWORD_PREFIX + token;
    let userId = await getAsync(key);

    if (!userId) {
      return {
        errors: [
          {
            //name of field on the front end.
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdParsed = parseInt(userId);
    const user = await User.findOne(userIdParsed);

    if (!user) {
      return {
        errors: [
          {
            //name of field on the front end.
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(
      { id: userIdParsed },
      { password: await argon2.hash(newPassword) }
    );

    const delKey = promisify(redis.del).bind(redis);
    delKey(key);

    //log user in after password has been changed.
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    //For typeORM, if not search by primary key, do:
    const user = await User.findOne({ where: { email } });
    if (!user) {
      //email not in db
      return true;
    }

    const token = v4();

    redis.set(
      FORGET_PASSWORD_PREFIX + token,
      `${user.id}`,
      "EX",
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    //not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      // User.create({}).save()'s alternative:
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        }) //without .returning("*"), this fucntion returns only fields that are automatically generated.
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "This user name was already taken.",
            },
          ],
        };
      }
    }

    //store user id session
    //this will set a cookie on the user
    //and keep them logged in
    req.session.userId = user.id;

    return { user };
  } //register

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username does not exist",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "Password",
            message: "Incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log("Logout error: ", err);
          resolve(false);
        }
        resolve(true);
      })
    );
  }
}
