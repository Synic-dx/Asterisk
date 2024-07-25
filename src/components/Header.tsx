'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Flex, Box, Text, Image } from '@chakra-ui/react';

interface NavLink {
  name: string;
  href?: string;
  action?: () => void;
  isActive?: boolean;
}

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const publicNavLinks: NavLink[] = [
    { name: "Info", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Sign In", href: "/sign-in" },
    { name: "Sign Up", href: "/sign-up" },
  ];

  const privateNavLinks: NavLink[] = [
    { name: "Home", href: "/dashboard" },
    { name: "Practice", href: "/practice" },
    { name: "Grader", href: "/grader" },
    { name: "Analyse", href: "/analyse" },
    { name: "Personalise", href: "/personalise" },
    { name: "Upgrade", href: "/upgrade" },
    { name: "Sign Out", action: () => signOut() },
  ];

  const handleNavigation = (href?: string, action?: () => void) => {
    if (action) {
      action();
    } else if (href) {
      router.push(href);
    }
  };

  const renderLinks = (links: NavLink[]) => (
    <Flex gap={4}>
      {links.map((link) => (
        <Box key={link.name}>
          <Button
            variant="link"
            colorScheme="purple"
            fontWeight={link.isActive ? 'bold' : 'normal'}
            _hover={{ color: 'purple.700' }}
            onClick={() => handleNavigation(link.href, link.action)}
          >
            {link.name}
          </Button>
        </Box>
      ))}
    </Flex>
  );

  return (
    <Flex
      align="center"
      justify="space-between"
      p={4}
      w={'100vw'}
      h={'5vh'}
      px={'10vw'}
    >
      <Box>
        <Image
          src="/Images/Header.svg"
          alt="Logo"
          draggable="false"
          cursor="pointer"
          onClick={() => router.push('/')}
        />
      </Box>
      <Box>
        {status === 'loading' ? (
          <Text>Loading...</Text>
        ) : session ? (
          renderLinks(privateNavLinks)
        ) : (
          renderLinks(publicNavLinks)
        )}
      </Box>
    </Flex>
  );
};

export default Header;
