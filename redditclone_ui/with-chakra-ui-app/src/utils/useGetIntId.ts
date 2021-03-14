import { useRouter } from "next/router";

//exercise: turn this into a generic function so that it works for any parameter.
export const useGetIntId = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  return intId;
};
