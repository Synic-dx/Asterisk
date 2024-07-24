'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NavLink {
  name: string;
  href?: string;
  action?: () => void;
  isActive?: boolean;
}

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const publicNavLinks: NavLink[] = [
    { name: "Info", href: "/info" },
    { name: "Features", href: "/features" },
    { name: "Sign In", href: "/sign-in" },
    { name: "Sign Up", href: "/sign-up" },
  ];

  const privateNavLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "Practice", href: "/practice" },
    { name: "Grader", href: "/grader" },
    { name: "Analyse", href: "/analyse" },
    { name: "Personalise", href: "/personalise" },
    { name: "Upgrade", href: "/upgrade" },
    { name: "Sign Out", action: () => signOut() },
  ];

  const renderLinks = (links: NavLink[]) => (
    <ul className="flex space-x-4">
      {links.map((link) => (
        <li key={link.name}>
          {link.href ? (
            <Link href={link.href}>
              <Button variant="link" className={`cursor-pointer ${link.isActive ? 'font-bold text-[#130529]' : 'text-[#130529]'} hover:text-purple-950`}>
                {link.name}
              </Button>
            </Link>
          ) : (
            <Button
              variant="link"
              onClick={link.action}
              className={`cursor-pointer ${link.isActive ? 'font-bold text-[#130529]' : 'text-[#130529]'} hover:text-purple-950`}
            >
              {link.name}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <header className="flex items-center justify-between p-4 text-[#130529]">
      <img
        src="/Images/Header.svg"
        alt="Logo"
        className="h-10"
      />
      <nav>
        {status === 'loading' ? (
          <p>Loading...</p>
        ) : session ? (
          renderLinks(privateNavLinks)
        ) : (
          renderLinks(publicNavLinks)
        )}
      </nav>
    </header>
  );
};

export default Header;