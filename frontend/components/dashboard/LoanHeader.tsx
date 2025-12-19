"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Wifi, Settings, User, Printer } from "lucide-react";
import Link from "next/link";

export function LoanHeader() {
  const { data: session } = useSession();
  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="border-b border-white/10 bg-slate-900/40 backdrop-blur-xl px-6 py-4 sticky top-0 z-40 print:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Covenant360</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mt-1">
            SLL Operating System
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/5 px-3 py-1">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            IoT Sensors: LIVE
          </Badge>
          
          <div className="h-6 w-px bg-white/10 mx-2" />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
          >
            <Printer className="mr-2 h-4 w-4" />
            Report
          </Button>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 text-slate-400 hover:text-emerald-400 transition-colors" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/5" asChild>
            <Link href="/profile">
              <Settings className="h-4 w-4 text-slate-400 hover:text-emerald-400 transition-colors" />
            </Link>
          </Button>
          
          <Link href="/profile">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg shadow-emerald-900/20 cursor-pointer hover:scale-105 transition-transform border border-white/10">
              {userInitials}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
