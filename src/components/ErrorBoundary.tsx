"use client";

import React, { Component, ErrorInfo } from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mb={4}>
            Something went wrong.
          </Heading>
          <Text mb={4}>We're sorry, but something went wrong. Please try again later.</Text>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
