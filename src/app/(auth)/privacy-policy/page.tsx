'use client';

import { NextPage } from 'next';
import { Box, Heading, Text, Link, VStack, List, ListItem } from '@chakra-ui/react';

const PrivacyPolicy: NextPage = () => {
  return (
    <Box p={8} maxW="container.md" mx="auto" bg="white" rounded="md" shadow="lg" my={'70px'}>
      <VStack spacing={6} align="start">
        <Heading as="h1" fontSize="2xl" color="#130529">
          Privacy Policy
        </Heading>
        <Text color="#271144">
          Welcome to Asterisk Academy. This Privacy Policy explains how we collect, use, and protect your information when you visit our platform.
        </Text>
        
        <Heading as="h2" fontSize="xl" color="#130529">
          Information We Collect
        </Heading>
        <Text color="#271144">
          We collect the following information:
        </Text>
        <List spacing={3} styleType="none" pl={4}>
          <ListItem color="#271144" position="relative" pl={4}>
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              width="8px"
              height="8px"
              bg="#130529"
              borderRadius="50%"
            />
            Email address: For login purposes and communication.
          </ListItem>
          <ListItem color="#271144" position="relative" pl={4}>
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              width="8px"
              height="8px"
              bg="#130529"
              borderRadius="50%"
            />
            IP address: To improve our platform and respond to queries.
          </ListItem>
          <ListItem color="#271144" position="relative" pl={4}>
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              width="8px"
              height="8px"
              bg="#130529"
              borderRadius="50%"
            />
            Browser type and device information: To enhance user experience and address technical issues.
          </ListItem>
        </List>
        
        <Heading as="h2" fontSize="xl" color="#130529">
          How We Use Your Information
        </Heading>
        <Text color="#271144">
          We use the collected information to:
        </Text>
        <List spacing={3} styleType="none" pl={4}>
          <ListItem color="#271144" position="relative" pl={4}>
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              width="8px"
              height="8px"
              bg="#130529"
              borderRadius="50%"
            />
            Authenticate your access to our platform.
          </ListItem>
          <ListItem color="#271144" position="relative" pl={4}>
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              width="8px"
              height="8px"
              bg="#130529"
              borderRadius="50%"
            />
            Communicate with you regarding your account and any issues.
          </ListItem>
          <ListItem color="#271144" position="relative" pl={4}>
            <Box
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              width="8px"
              height="8px"
              bg="#130529"
              borderRadius="50%"
            />
            Improve our services based on usage patterns and technical performance.
          </ListItem>
        </List>

        <Heading as="h2" fontSize="xl" color="#130529">
          How We Protect Your Information
        </Heading>
        <Text color="#271144">
          We implement security measures to safeguard your information. User passwords are hashed to protect them from unauthorized access. However, no system can be entirely secure, so we cannot guarantee absolute protection.
        </Text>

        <Heading as="h2" fontSize="xl" color="#130529">
          Contact Us
        </Heading>
        <Text color="#271144">
          If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
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

export default PrivacyPolicy;
