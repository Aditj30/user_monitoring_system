"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNavBar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/login", label: "Login" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tight font-headline text-on-surface">
          IdentityPro
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-primary font-semibold border-b-2 border-primary transition-all duration-200"
                  : "text-on-surface-variant hover:text-on-surface transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href="/register" className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2 rounded-full font-semibold hover:scale-[1.02] transition-transform shadow-sm">
            Register
          </a>
        </div>
      </div>
      <div className="bg-outline-variant/20 h-[1px] w-full"></div>
    </header>
  );
}