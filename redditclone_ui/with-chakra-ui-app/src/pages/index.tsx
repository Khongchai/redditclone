import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Box, Heading, Text, Link, Stack } from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 5,
    },
  });
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
        data.posts.map((post) => (
          <Stack spacing={8} _last={{ marginBottom: "10px" }}>
            <Box ml={4} key={post.id}>
              {post.title}
            </Box>
            <Box p={5} shadow="md" key={post.id} borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>
                {post.text.length > 20
                  ? post.text.slice(post.text.length / 2) + "..."
                  : post.text}
              </Text>
            </Box>
          </Stack>
        ))
      )}
    </Layout>
  );
};
//set ssr to true for to serverside render the Index page
//note: ssr only if page is static
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
