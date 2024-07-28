'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import MarkdownWrapper from '@/components/MarkdownWrapper';

// Define the test content
const testContent = `## Economics Graph

<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f4f4f4"/>
  <line x1="50" y1="350" x2="550" y2="350" stroke="black" stroke-width="2"/>
  <line x1="50" y1="50" x2="50" y2="350" stroke="black" stroke-width="2"/>
  <line x1="50" y1="350" x2="550" y2="50" stroke="blue" stroke-width="2"/>
  <text x="300" y="370" font-size="16" text-anchor="middle">Economics Trend</text>
</svg>`;

// TestPage component
const TestPage: React.FC = () => {
  return (
    <Box mx="auto" p={6}>
      <MarkdownWrapper>{testContent}</MarkdownWrapper>
    </Box>
  );
};

export default TestPage;
