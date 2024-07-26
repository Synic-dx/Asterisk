import React from "react";
import { Container, ResponsiveValue } from "@chakra-ui/react";

interface PageWrapperProps {
  children: React.ReactNode;
  minHeight?: string | ResponsiveValue<string>; // Update type here
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, minHeight }) => {
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
      px={0}
      minHeight={minHeight} // Use minHeight here
    >
      {children}
    </Container>
  );
};

export default PageWrapper;
