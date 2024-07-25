// app/client-layout.tsx
"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light">
        <ChakraProvider>{children}</ChakraProvider>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
