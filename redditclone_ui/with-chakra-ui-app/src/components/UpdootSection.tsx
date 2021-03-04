import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutationVariables,
} from "../generated/graphql";

interface UpdootSectionProps {
  //The two below are equivalent
  //post: PostsQuery["posts"]["posts"][0];
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  //We have to create our own loading state indicator because we do not know whether
  //the "fetching" up there is for updoot or downdoot
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");

  return (
    <Flex flexDir={"column"} align="center">
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("updoot-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "updoot-loading"}
        aria-label="upvote-icon"
        icon={<ChevronUpIcon />}
        size="24px"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downdoot-loading");
          vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        colorScheme={post.voteStatus === -1 ? "orange" : undefined}
        variant="solid"
        isLoading={loadingState === "downdoot-loading"}
        aria-label="downvote-icon"
        icon={<ChevronDownIcon />}
        size="24px"
      />
    </Flex>
  );
};
