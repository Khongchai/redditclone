import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Box, Heading, Text, Link } from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout variant="regular">
      <NextLink href="/create-post">
        <Link>Create post</Link>
      </NextLink>
      <Heading as="h1" ml={4}>
        Posts:
      </Heading>
      {!data ? (
        <Text ml={4}>loading...</Text>
      ) : (
        data.posts.map((post) => {
          return (
            <Box ml={4} key={post.id}>
              {post.title}
            </Box>
          );
        })
      )}
    </Layout>
  );
};
//set ssr to true for to serverside render the Index page
//note: ssr only if page is static
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
