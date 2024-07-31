'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import MarkdownWrapper from '@/components/MarkdownWrapper';

// Define the test content
const testContent = 'To solve this problem, we use the kinematic equation for uniformly accelerated motion: \n\ns = ut + ½at²\n\nwhere:\n\n- s is the distance traveled\n- u is the initial velocity (0 m/s, since the car starts from rest)\n- t is the time (10 seconds)\n- a is the acceleration\n\nFirst, we need to find the acceleration (a). Using the formula for acceleration:\n\na = (v - u) / t\n\nwhere v is the final velocity (30 m/s), we get:\n\na = (30 m/s - 0 m/s) / 10 s = 3 m/s²\n\nNow, we can substitute the values into the kinematic equation:\n\ns = 0 m/s × 10 s + ½ × 3 m/s² × (10 s)²\n\ns = 0 + ½ × 3 × 100\n\ns = 150 meters\n\nTherefore, the distance traveled by the car is 150 meters.';

// TestPage component
const TestPage: React.FC = () => {
  return (
    <Box mx="auto" p={6}>
      <MarkdownWrapper>{testContent}</MarkdownWrapper>
    </Box>
  );
};

export default TestPage;
