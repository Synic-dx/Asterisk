'use client';

import { Box, Flex, Image } from '@chakra-ui/react';
import Header from '@/components/Header';
import SignUpForm from '@/components/SignUpComponent';
import { NextPage } from 'next';
import PageWrapper from '@/components/FullScreenPage';

const SignUpPage: NextPage = () => {
  return (
    <PageWrapper>
    <Flex direction="column">
      <Header />
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          p="8"
        >
          <Image
            src="/Images/hourglassMan.png"
            alt="Graphic"
            w={{ base: '50%', md: '33%' }}
            mb={{ base: '6', md: '0' }}
            mr={{ md: '6' }}
            draggable="false"
            display={{ base: 'none', md: 'block' }}
          />
          <SignUpForm />
        </Flex>
      </Flex>
    </PageWrapper>
  );
};

export default SignUpPage;