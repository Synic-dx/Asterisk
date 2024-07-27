'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import MarkdownWrapper from '@/components/MarkdownWrapper';

// Define the test content
const testContent = "The pH of a solution is calculated as -log[H⁺]. For a hydrogen ion concentration of 1 × 10⁻³ M, pH = -log(1 × 10⁻³) = 3. Therefore, the correct answer is 3, making option B correct.";

// TestPage component
const TestPage: React.FC = () => {
  return (
    <Box mx="auto" p={6}>
      <MarkdownWrapper>{testContent}</MarkdownWrapper>
    </Box>
  );
};

export default TestPage;
