import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  //data is loading
  if (fetching) {
    //user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link ml={"4"}>Register</Link>
        </NextLink>
      </>
    );
    //user is logged in
  } else {
    body = (
      <Flex>
        <Box>{data.me.username}</Box>
        <Button ml="4" color="white" variant="link">
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex p="4" bg="tomato" ml={"auto"}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
