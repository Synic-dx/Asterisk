// app/client-layout.tsx
"use client";

import React from 'react';
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "@/components/Header"; // Import your Header component
import Loading from "@/components/ui/Loading"; // Import your Loading component
import Footer from '@/components/Footer';

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
            <Footer />
          </React.Suspense>
        </ChakraProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
