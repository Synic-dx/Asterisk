import React from "react";
import { Container } from "@chakra-ui/react";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <Container
      minW="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="var(--background)"
      color="var(--foreground)"
      p={4}
    >
        {children}
    </Container>
  );
};

export default PageWrapper;
