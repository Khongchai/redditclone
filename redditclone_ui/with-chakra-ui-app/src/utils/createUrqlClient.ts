import { cacheExchange } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
  CombinedError,
  dedupExchange,
  errorExchange,
  fetchExchange,
  Operation,
} from "urql";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

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
