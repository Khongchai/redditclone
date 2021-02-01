import { Navbar } from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Box, Heading, Text } from "@chakra-ui/react";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
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
    </>
  );
};
//set ssr to true for to serverside render the Index page
//note: ssr only if page is static
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
