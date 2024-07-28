'use client';

import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

interface NavLink {
  name: string;
  href?: string;
  action?: () => void;
  icon?: React.JSX.Element;
}

interface HeaderLinksProps {
  status: "loading" | "authenticated" | "unauthenticated";
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

  const [clickedLink, setClickedLink] = useState<string | null>(null);

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
    {
      name: "Sign Out",
      action: () => {
        onSignOut();
        setClickedLink(null);
      },
      icon: <LogOut size={16} style={{ marginRight: '4px' }} />,
    },
  ];

  const links = status === "loading" ? publicNavLinks : session ? privateNavLinks : publicNavLinks;
  const linkGap = session ? "4vw" : "7vw";

  useEffect(() => {
    if (isMobile) {
      const handleTouchStart = (e: TouchEvent) => {
        const touchStartX = e.touches[0].clientX;
        const handleTouchMove = (moveEvent: TouchEvent) => {
          const touchEndX = moveEvent.touches[0].clientX;
          if (touchStartX < touchEndX - 50) {
            onOpen();
          }
          document.removeEventListener("touchmove", handleTouchMove);
        };
        document.addEventListener("touchmove", handleTouchMove);
      };
      document.addEventListener("touchstart", handleTouchStart);

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
      };
    }
  }, [isMobile, onOpen]);

  return (
    <Flex justifyContent="space-between" alignItems="center">
      {isMobile ? (
        <>
          <Box as="button" aria-label="Open Menu" onClick={onOpen} _hover={{ boxShadow: "xl" }}>
            <Menu size={24} />
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
                      color={link.href === pathname ? "#130529" : "#271144"}
                      width="100%"
                      fontSize={isMobile && session && privateNavLinks.some(privateLink => privateLink.name === link.name) ? "lg" : "md"} // Increase font size for private links on mobile
                      padding="1rem"
                      backgroundColor="white"
                      borderRadius="md"
                      fontWeight={link.href === pathname ? "700" : "500"}
                      _hover={{
                        backgroundColor: "#f0f0f0",
                        color: "#130529",
                      }}
                      onClick={() => {
                        setClickedLink(link.href ?? null);
                        setTimeout(() => setClickedLink(null), 300);
                        onNavigate(link.href, link.action);
                        onClose();
                      }}
                      _active={{
                        color: "#130529",
                      }}
                    >
                      {link.icon && link.icon}
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
            <Box
              key={link.name}
              mt={session && privateNavLinks.some(privateLink => privateLink.name === link.name) ? 1 : 0} // Apply mt={1} to private links
              fontSize={{ base: isMobile && session && privateNavLinks.some(privateLink => privateLink.name === link.name) ? "lg" : "md", md: "md" }} // Increase font size for private links on mobile
            >
              <Button
                variant="link"
                color={link.href === pathname || link.href === clickedLink ? "#130529" : "#271144"}
                fontFamily="Roboto, sans-serif"
                fontSize={session && !publicNavLinks.some(publicLink => publicLink.href === link.href) ? "sm" : "lg"}
                fontWeight={link.href === pathname ? "bold" : "normal"}
                _hover={{
                  transform: "translateY(2px)",
                  color: "#130529",
                }}
                onClick={() => {
                  setClickedLink(link.href ?? null);
                  setTimeout(() => setClickedLink(null), 300);
                  onNavigate(link.href, link.action);
                }}
              >
                {link.icon && link.icon}
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
