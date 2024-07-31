import React from "react";
import { Container, ResponsiveValue } from "@chakra-ui/react";

interface PageWrapperProps {
  children: React.ReactNode;
  minHeight?: string | ResponsiveValue<string>;
  mb?: string | ResponsiveValue<string>;
  px?: string | ResponsiveValue<string>;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, minHeight, mb, px }) => {
  return (
    <Container
      minW="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="var(--background)"
      color="var(--foreground)"
      py={4}
      minHeight={minHeight} 
      mb={mb}
      px={px}
    >
      {children}
    </Container>
  );
};

export default PageWrapper;
