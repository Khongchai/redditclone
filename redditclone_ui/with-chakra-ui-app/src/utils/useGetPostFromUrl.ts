import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const router = useRouter();
  const intId = useGetIntId();
  return usePostQuery({
    //if intId is negative 1 then we know that something is wrong with the param
    //so don't even bother sending the request and pause it.
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
