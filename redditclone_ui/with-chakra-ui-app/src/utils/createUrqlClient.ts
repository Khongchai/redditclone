import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
  CombinedError,
  dedupExchange,
  errorExchange,
  fetchExchange,
  Operation,
  stringifyVariables,
} from "urql";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

/*
  Positional arguments reference for resolvers:

parent
  This is the return value of the resolver for this field's parent (the resolver for a parent field always executes before the resolvers for that field's children).
args
  This object contains all GraphQL arguments provided for this field.
context
  This is an object shared by all resolvers in a particular query.	
info
  {basically all infos including names}
  It contains information about the execution state of the query, including the field name, path to the field from the root.
*/

//this entire thing is just to check whether to run the query again or not.
export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    //ex. entityKey: "Query", fieldName: posts
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    //example: in the case of "posts" query, filter out everything that are also "query" but are not "posts".
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    console.log(fieldInfos);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    //construct the name of this graphql query, eg. post(limit:10)
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    //check if this query has been cached (if not cached, it's new). If the stuff is cached, retrieve it.
    const cachedStuff = cache.resolve(entityKey, fieldKey);
    //the query will be able to run next time only if info.partial is set to true(like only partially complete, sothere's more info to be had),
    //we flip the cachedStuff because if a query does not exist in the cache, we would want to rerun the query and store it.
    //and we do that by turning the "not exist" status into true, and assign it to info.partial to tell URQL that the data is only
    //partially fetched, fetch more pls.
    info.partial = !cachedStuff;
    const results: string[] = [];
    fieldInfos.forEach((field) => {
      const data = cache.resolve(entityKey, field.fieldKey) as string[];
      results.push(...data);
    });

    return results;
    //if info.partial is true, another query is run immediately after this return statement;
    //after which this function is run again.
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    //for getting and setting cookies
    credentials: "include" as const,
  },
  //this manual update is to ensure that urql recache pages after any change is made.
  exchanges: [
    dedupExchange,
    errorExchange({
      onError: (error: CombinedError, operation: Operation) => {
        if (error.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      },
    }),
    cacheExchange({
      resolvers: {
        Query: {
          //name should match the name of query in the graphql file
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                //recache the page when there are no errors
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                //recache the page when there are no errors
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
