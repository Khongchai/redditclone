import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import {
  Box,
  Heading,
  Text,
  Link,
  Stack,
  Flex,
  Button,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  if (!fetching && !data) {
    return <>No data</>;
  }
  return (
    <Layout variant="regular">
      <Flex align="center">
        <Heading>RedditClone</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>
      <Heading as="h1" ml={4}>
        Posts:
      </Heading>
      {!data && fetching ? (
        <Text ml={4}>loading...</Text>
      ) : (
        data!.posts.map((post) => (
          <Stack spacing={8} _last={{ marginBottom: "10px" }}>
            <Box p={5} shadow="md" key={post.id} borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet + "..."}</Text>
            </Box>
          </Stack>
        ))
      )}
      {data ? (
        <Flex>
          <Button
            onClick={() =>
              //for every click, set the limit and the position of the cursor.
              setVariables({
                limit: variables.limit,
                cursor: data.posts[data.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
            m={"auto"}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};
//set ssr to true for to serverside render the Index page
//note: ssr only if page is static
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
