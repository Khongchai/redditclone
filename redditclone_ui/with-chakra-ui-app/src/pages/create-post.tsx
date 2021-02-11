import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

export default withUrqlClient(createUrqlClient)(function CreatePost() {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });
          if (error?.message.includes("not authenticated")) {
            setErrors({ title: "Error, not authenticated" });
            router.push("/login");
          } else {
            router.push("/");
          }
        }}
      >
        {(props) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="text..."
                label="Body"
                textarea
              />
            </Box>

            <Button
              mt={4}
              isLoading={props.isSubmitting}
              colorScheme="teal"
              type="submit"
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
});
