// app/client-layout.tsx
'use client';

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react";
import React from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light">
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
