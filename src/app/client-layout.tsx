"use client";

import React from "react";
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "@/components/Header";
import Loading from "@/components/ui/Loading";
import Footer from "@/components/Footer";

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
            <main>
            {children}
            </main>
            <Footer />
          </React.Suspense>
        </ChakraProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
