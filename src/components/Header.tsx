"use client";

import React, { Suspense, lazy } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Flex, Box, Text, Image } from "@chakra-ui/react";
import PageWrapper from "./FullScreenPage";

// Define a lazy-loaded component for the links
const HeaderLinks = lazy(() => import("./HeaderLinks"));

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleNavigation = (href?: string, action?: () => void) => {
    if (action) {
      action();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <PageWrapper>
      <header>
      <Flex
        align="center"
        justify="space-between"
        p={4}
        w={"100vw"}
        h={"5vh"}
        px={"10vw"}
      >
        <Box>
          <Image
            src="https://raw.githubusercontent.com/Synic-dx/Asterisk/5c4b99a0e248d8d1db4815eb62d766c1b75b4868/public/Images/Header.svg"
            alt="Logo"
            draggable="false"
            cursor="pointer"
            onClick={() => router.push("/")}
          />
        </Box>
        <Box>
          <HeaderLinks
            status={status}
            session={session}
            onNavigate={handleNavigation}
            onSignOut={() => signOut()}
          />
        </Box>
      </Flex>
      </header>
    </PageWrapper>
  );
};

export default Header;
