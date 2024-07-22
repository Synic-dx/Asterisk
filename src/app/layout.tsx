import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from 'next';

const BASE_URL = process.env.BASE_URL || 'https://asterisk.academy';

export const metadata: Metadata = {
  title: 'Asterisk Academy - Unlimited IGCSE & A-Level Practice Questions',
  description: 'Join Asterisk Academy to access an extensive library of unlimited free practice questions for IGCSE & A-Level subjects, including a vast reservoir of free topical MCQs. Improve your grades with our smart algorithm-based learning platform. Sign up now!',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'Asterisk Academy - Unlimited IGCSE & A-Level Practice Questions',
    description: 'Join Asterisk Academy to access an extensive library of unlimited free practice questions for IGCSE & A-Level subjects, including a vast reservoir of free topical MCQs. Improve your grades with our smart algorithm-based learning platform. Sign up now!',
    images: [
      {
        url: '[Link to an image showcasing your website or logo]',
        alt: 'Asterisk Academy Logo',
      },
    ],
    siteName: 'Asterisk Academy',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asterisk Academy - Unlimited IGCSE & A-Level Practice Questions',
    description: 'Join Asterisk Academy to access an extensive library of unlimited practice questions for IGCSE & A-Level subjects, including topical online learning resources, educational materials, and study guides. Improve your grades with our smart algorithm-based learning platform. Sign up now!',
    images: [
      {
        url: '[Link to an image showcasing website or logo]',
        alt: 'Asterisk Academy Logo',
      },
    ],
  },
  authors: [
    { name: 'Shinjan Garain', url: 'https://synic.vercel.app/' }
  ],
  viewport: 'width=device-width, initial-scale=1',
  alternates: {
    canonical: BASE_URL,
  },
  metadataBase: new URL(BASE_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
