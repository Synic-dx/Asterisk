// components/Loading.tsx
import React from 'react';
import { Center, Spinner } from '@chakra-ui/react';

const Loading: React.FC = () => (
  <Center h="100vh">
    <Spinner size="xl" />
  </Center>
);

export default Loading;
