import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Wifi, Settings } from "lucide-react";

export function LoanHeader() {
  return (
    <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
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
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4 text-slate-400 hover:text-slate-50" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-slate-50 font-semibold text-sm">
            SG
          </div>
        </div>
      </div>
    </div>
  );
}

