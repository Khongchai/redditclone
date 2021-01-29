import React from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useRegisterMutation } from "../generated/graphql";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  //graphql code generator was brought in to the mutation
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          //the values in the initial values match exactly to the graphql
          //variable values, so we can just pass in the values variable into
          //register. Otherwise, it will have to be something like
          //username: values.username
          const response = await register(values);
          return response;
        }}
      >
        {(props) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              isLoading={props.isSubmitting}
              colorScheme="teal"
              type="submit"
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
