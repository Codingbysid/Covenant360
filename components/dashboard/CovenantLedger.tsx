import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyData } from "@/lib/mockData";

interface CovenantLedgerProps {
  monthlyDataWithRates: (MonthlyData & {
    rateApplied?: number;
    notes?: string;
  })[];
}

export function CovenantLedger({ monthlyDataWithRates }: CovenantLedgerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Covenant Ledger</CardTitle>
        <CardDescription>Historical compliance and rate adjustments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Leverage Ratio</TableHead>
              <TableHead>Carbon Output (tons)</TableHead>
              <TableHead>Rate Applied (%)</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyDataWithRates.map((month) => (
              <TableRow key={month.month}>
                <TableCell className="font-medium">{month.month}</TableCell>
                <TableCell>
                  <span
                    className={`tabular-nums tracking-tight ${
                      month.financialCovenantMet ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {month.leverageRatio.toFixed(2)}x
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`tabular-nums tracking-tight ${
                      month.esgTargetMet ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {month.carbonEmissions}
                  </span>
                </TableCell>
                <TableCell className="font-mono tabular-nums tracking-tight text-slate-50">
                  {month.rateApplied?.toFixed(2)}%
                </TableCell>
                <TableCell className="text-xs text-slate-400">{month.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

