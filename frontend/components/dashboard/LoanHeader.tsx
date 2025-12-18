"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Wifi, Settings, User } from "lucide-react";
import Link from "next/link";

export function LoanHeader() {
  const { data: session } = useSession();
  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="border-b border-white/10 bg-slate-900/40 backdrop-blur-xl px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Covenant360</h1>
          <p className="text-sm text-slate-400">
            The Unified Operating System for Sustainability-Linked Loans
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-emerald-500 text-emerald-400">
            <Wifi className="mr-2 h-3 w-3" />
            Connected to IoT Sensors: LIVE
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 text-slate-400 hover:text-slate-50" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/profile">
              <Settings className="h-4 w-4 text-slate-400 hover:text-slate-50" />
            </Link>
          </Button>
          <Link href="/profile">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-slate-50 font-semibold text-sm cursor-pointer hover:bg-emerald-700 transition-colors">
              {userInitials}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

