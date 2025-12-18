"use client";

import Link from "next/link";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Covenant360 Home">
          <Shield className="h-6 w-6 text-emerald-400" aria-hidden="true" />
          <span className="text-xl font-bold text-slate-50">Covenant360</span>
        </Link>
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login" className="flex items-center gap-2" aria-label="Sign in to Covenant360">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </Link>
          </Button>
        </nav>
      </div>
    </nav>
  );
}

