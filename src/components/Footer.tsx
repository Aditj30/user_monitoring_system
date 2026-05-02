import React from "react";

export function Footer() {
  return (
    <footer className="py-12 bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-2xl font-black font-headline text-primary">IdentityPro</div>
        <div className="flex gap-8">
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Documentation
          </a>
          <a
            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Security
          </a>
        </div>
        <p className="text-sm text-on-surface-variant">
          © 2026 IdentityPro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
