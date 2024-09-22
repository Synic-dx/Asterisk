import { Box, Flex, Image } from '@chakra-ui/react';
import SignUpForm from '@/components/SignUpComponent';
import { NextPage } from 'next';
import PageWrapper from '@/components/FullScreenPage';

const SignUpPage: NextPage = () => {
  return (
    <PageWrapper minHeight={{ base: '60vh', md: 'auto' }} mb={{base: '35vh', md: '0'}}>
      <Flex direction="column">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          gap={"10vw"}
          px="8"
        >
          <Image
            src="https://raw.githubusercontent.com/Synic-dx/IMGCDN/master/public/Images/hourglassMan.png"
            alt="Graphic"
            w={{ base: 'none', md: '35%' }}
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
