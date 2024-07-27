'use client';

import { NextPage } from 'next';
import { Box, Heading, Text, VStack, Link } from '@chakra-ui/react';

const TermsConditionsPage: NextPage = () => {
  return (
    <Box p={8} maxW="container.md" mx="auto" bg="white" rounded="md" shadow="lg" my="70px">
      <VStack spacing={6} align="start">
        <Heading as="h1" fontSize="2xl" color="#130529">
          Terms and Conditions
        </Heading>
        <Text color="#271144">
          Welcome to Asterisk Academy. These Terms and Conditions outline the rules and guidelines for using our platform. By accessing or using our services, you agree to comply with these terms.
        </Text>

        <Heading as="h2" fontSize="xl" color="#130529">
          Refund Policy
        </Heading>
        <Text color="#271144">
          Please note that all purchases made on Asterisk Academy are non-refundable. We encourage you to carefully review your decision before completing a purchase. By making a purchase, you acknowledge and accept that refunds will not be issued.
        </Text>

        <Heading as="h2" fontSize="xl" color="#130529">
          Platform Integrity and Security
        </Heading>
        <Text color="#271144">
          We are committed to maintaining the security and integrity of our platform. To this end, any attempts to interfere with or compromise our system, including unauthorized access or manipulation of data, may result in the suspension or termination of your account. Additionally, we may take appropriate action to protect our platform's security and functionality. We appreciate your understanding and cooperation in helping us maintain a secure environment.
        </Text>

        <Heading as="h2" fontSize="xl" color="#130529">
          Contact Us
        </Heading>
        <Text color="#271144">
          If you have any questions or concerns about these Terms and Conditions, please feel free to contact us at{' '}
          <Link href="mailto:team.asterisk.2025@gmail.com" color="purple.600">
            teamasterisk.2025@gmail.com
          </Link>.
        </Text>

        <Text fontSize="sm" color="gray.500">
          Last updated: 27 July 2024
        </Text>
      </VStack>
    </Box>
  );
};

export default TermsConditionsPage;
