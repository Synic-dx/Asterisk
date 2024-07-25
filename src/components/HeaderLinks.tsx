'use client';

import React from 'react';
import {
  Button,
  Flex,
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Session } from 'next-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';

interface NavLink {
  name: string;
  href?: string;
  action?: () => void;
}

interface HeaderLinksProps {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  session: Session | null;
  onNavigate: (href?: string, action?: () => void) => void;
  onSignOut: () => void;
}

const HeaderLinks: React.FC<HeaderLinksProps> = ({
  status,
  session,
  onNavigate,
  onSignOut,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const pathname = usePathname();

  const publicNavLinks: NavLink[] = [
    { name: 'Info', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Sign In', href: '/sign-in' },
    { name: 'Sign Up', href: '/sign-up' },
  ];

  const privateNavLinks: NavLink[] = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Practice', href: '/practice' },
    { name: 'Grader', href: '/grader' },
    { name: 'Analyse', href: '/analyse' },
    { name: 'Personalise', href: '/personalise' },
    { name: 'Upgrade', href: '/upgrade' },
    { name: 'Sign Out', action: onSignOut },
  ];

  // Determine which links to show based on the status
  const links =
    status === 'loading'
      ? publicNavLinks
      : session
      ? privateNavLinks
      : publicNavLinks;

  const linkGap = session ? '4vw' : '7vw';

  return (
    <Flex justifyContent="space-between" alignItems="center">
      {isMobile ? (
        <>
          <Box as="button" aria-label="Open Menu" onClick={onOpen} _hover={{ boxShadow: 'xl' }}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </Box>
          <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Navigation</DrawerHeader>
              <DrawerBody>
                <Flex direction="column" gap={4}>
                  {links.map((link) => (
                    <Button
                      key={link.name}
                      variant="link"
                      color="#130529"
                      fontFamily="Roboto, sans-serif"
                      fontSize="lg"
                      fontWeight={link.href === pathname ? 'bold' : 'normal'}
                      _hover={{
                        transform: 'translateY(-2px)',
                        color: '#130529',
                      }}
                      onClick={() => {
                        onNavigate(link.href, link.action);
                        onClose(); // Close drawer on navigation
                      }}
                    >
                      {link.name}
                    </Button>
                  ))}
                </Flex>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Flex gap={linkGap}>
          {links.map((link) => (
            <Box key={link.name}>
              <Button
                variant="link"
                color="#130529"
                fontFamily="Roboto, sans-serif"
                fontSize="lg"
                fontWeight={link.href === pathname ? 'bold' : 'normal'}
                _hover={{
                  transform: 'translateY(2px)',
                  color: '#130529',
                }}
                onClick={() => onNavigate(link.href, link.action)}
              >
                {link.name}
              </Button>
            </Box>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default HeaderLinks;
