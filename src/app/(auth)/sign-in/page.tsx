'use client'
import { NextPage } from 'next';
import React, {useState} from 'react';
import { Flex, Image } from '@chakra-ui/react';
import PageWrapper from '@/components/FullScreenPage';

const SignIn: NextPage = () => {
  return (
    <PageWrapper>
      <Flex direction="column">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          gap={"10vw"}
          px="8"
        >
          <Image
            src="/Images/hourglassMan.png"
            alt="Graphic"
            w={{ base: 'none', md: '35%' }}
            mb={{ base: '6', md: '0' }}
            mr={{ md: '6' }}
            draggable="false"
            display={{ base: 'none', md: 'block' }}
          />
        </Flex>
      </Flex>
    </PageWrapper>
  );
};

export default SignIn;