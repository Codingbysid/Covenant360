import { LOAN_DATA } from "@/lib/mockData";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyData } from "@/lib/mockData";

interface LoanSummaryProps {
  currentMonth: MonthlyData;
}

export function LoanSummary({ currentMonth }: LoanSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Borrower</CardDescription>
          <CardTitle className="text-xl">{LOAN_DATA.borrowerName}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Facility Amount</CardDescription>
          <CardTitle className="text-xl tabular-nums">
            ${(LOAN_DATA.totalFacilityAmount / 1000000).toFixed(0)}M
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Status</CardDescription>
          <CardTitle className="text-xl">
            <Badge
              variant={
                currentMonth.financialCovenantMet && currentMonth.esgTargetMet
                  ? "success"
                  : "warning"
              }
            >
              {currentMonth.financialCovenantMet && currentMonth.esgTargetMet
                ? "COMPLIANT"
                : "MONITORING"}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

