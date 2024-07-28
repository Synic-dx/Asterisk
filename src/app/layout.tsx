import React, { Suspense } from "react";
import ClientLayout from "./client-layout"; // Import the new client layout
import { Metadata } from "next";

const BASE_URL = process.env.BASE_URL || "https://asterisk.academy";

export const metadata: Metadata = {
  title: "Asterisk Academy - Unlimited IGCSE & A-Level Practice",
  description:
    "Join Asterisk Academy to access an extensive library of unlimited free topical MCQs for IGCSE & A-Level subjects as well as a robust AI essay Grader for History, English, Business and other subjective papers. Improve your grades with our smart algorithm-based learning platform. Sign up now!",
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "Asterisk Academy - Unlimited IGCSE & A-Level Practice",
    description:
      "Join Asterisk Academy to access an extensive library of unlimited free topical MCQs for IGCSE & A-Level subjects as well as a robust AI essay Grader for History, English, Business and other subjective papers. Improve your grades with our smart algorithm-based learning platform. Sign up now!",
    images: [
      {
        url: "[Link to an image showcasing your website or logo]",
        alt: "Asterisk Academy Logo",
      },
    ],
    siteName: "Asterisk Academy",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asterisk Academy - Unlimited IGCSE & A-Level Practice",
    description:
      "Join Asterisk Academy to access an extensive library of unlimited practice questions for IGCSE & A-Level subjects, including topical online learning resources, educational materials, and study guides. Improve your grades with our smart algorithm-based learning platform. Sign up now!",
    images: [
      {
        url: "[Link to an image showcasing website or logo]",
        alt: "Asterisk Academy Logo",
      },
    ],
  },
  authors: [{ name: "Shinjan Garain", url: "https://synic.vercel.app/" }],
  alternates: {
    canonical: BASE_URL,
  },
  metadataBase: new URL(BASE_URL),
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Images/Logo.svg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;700&family=Karla:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
            html, body {
              overflow-x: hidden;
            }
          `}
        </style>
      </head>
      <body style={{ overflowX: "hidden" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
