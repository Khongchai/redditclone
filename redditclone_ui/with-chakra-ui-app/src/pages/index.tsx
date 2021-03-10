import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";

import {
  Box,
  Heading,
  Text,
  Link,
  Stack,
  Flex,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import React, { useState } from "react";
import { UpdootSection } from "../components/UpdootSection";
import { DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [deleteIndex, setDeleteIndex] = useState(0);

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <>No data</>;
  }

  return (
    <Layout variant="regular">
      {!data && fetching ? (
        <Text ml={4}>loading...</Text>
      ) : (
        data!.posts.posts.map((post) =>
          !post ? null : (
            <Stack spacing={8} _last={{ marginBottom: "10px" }}>
              <Box p={5} shadow="md" key={post.id} borderWidth="1px">
                <Flex>
                  <Flex flexDir={"column"} align="center">
                    <UpdootSection post={post} />
                  </Flex>
                  <Box flexDir="row" p="0 0 0 1em" w={"100%"}>
                    <Flex flexDir="column">
                      <Flex>
                        <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                          <Link>
                            <Heading fontSize="xl">{post.title}</Heading>
                          </Link>
                        </NextLink>
                        <Text ml={"auto"}>
                          Posted By: <b>{post.creator.username}</b>
                        </Text>
                      </Flex>
                      <Text mt={4}>{post.textSnippet + "..."}</Text>
                      <IconButton
                        ml="auto"
                        icon={<DeleteIcon />}
                        aria-label="Delete Post"
                        colorScheme="orange"
                        onClick={() => {
                          setDeleteIndex(deleteIndex + 1);
                          deletePost({ id: post.id });
                        }}
                      />
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Stack>
          )
        )
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              //for every click, set the limit and the position of the cursor.
              {
                console.log(data.posts.posts.length);
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1 - deleteIndex]
                      .createdAt,
                });
              }
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
