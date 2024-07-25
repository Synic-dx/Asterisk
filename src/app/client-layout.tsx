// app/client-layout.tsx
"use client";

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "@/components/Header"; // Import your Header component
import Loading from "@/components/ui/Loading"; // Import your Loading component

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light">
        <ChakraProvider>
          <React.Suspense fallback={<Loading />}>
            <Header />
            {children}
          </React.Suspense>
          <Toaster />
        </ChakraProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
