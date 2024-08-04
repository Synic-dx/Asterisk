"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import MarkdownWrapper from "@/components/MarkdownWrapper";

// Define the test content
const testContent =
  "In the Production Possibility Curve (PPC) diagram below, what does a movement from point A to point B along the curve signify?\n\n```\nGood Y\n^\n|\n|            B\n|           /\n|          /\n|         /\n|        /\n|       /\n|      /  \n|     /   \n|    /     \n|   /     \n|  /     \n| /     \n|/_________________________→ Good X\nA\n```\n";

// TestPage component
const TestPage: React.FC = () => {
  return (
    <Box mx="auto" p={6}>
      <MarkdownWrapper>{testContent}</MarkdownWrapper>
    </Box>
  );
};

export default TestPage;
