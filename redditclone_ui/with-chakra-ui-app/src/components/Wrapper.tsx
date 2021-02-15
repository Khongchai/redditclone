import { Box, Stack } from "@chakra-ui/react";
import React from "react";

export type WrapperVariant = "small" | "regular";

//interface for the component's props
interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant }) => {
  return (
    <Stack
      mt="8"
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
      spacing={6}
      pb={10}
    >
      {children}
    </Stack>
  );
};
