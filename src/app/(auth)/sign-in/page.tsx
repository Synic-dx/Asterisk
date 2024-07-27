import { Box, Flex, Image } from '@chakra-ui/react';
import SignInForm from '@/components/SignInComponent'; // Ensure this path is correct
import { NextPage } from 'next';
import PageWrapper from '@/components/FullScreenPage'; // Ensure this path is correct

const SignInPage: NextPage = () => {
  return (
    <PageWrapper minHeight={{ base: '60vh', md: 'auto' }}>
      <Flex direction="column" align="center" justify="center" py={8}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          gap={{ base: '4', md: '10vw' }}
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
          <SignInForm />
        </Flex>
      </Flex>
    </PageWrapper>
  );
};

export default SignInPage;
