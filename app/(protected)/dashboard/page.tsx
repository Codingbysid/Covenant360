"use client";

import { LOAN_DATA } from "@/lib/mockData";
import { calculateCurrentRate } from "@/lib/logic";
import { useMemo, useState } from "react";
import { LoanAnalyst } from "@/components/LoanAnalyst";
import { LoanHeader } from "@/components/dashboard/LoanHeader";
import { LoanSummary } from "@/components/dashboard/LoanSummary";
import { LiveRateCards } from "@/components/dashboard/LiveRateCards";
import { CovenantCharts } from "@/components/dashboard/CovenantCharts";
import { CovenantLedger } from "@/components/dashboard/CovenantLedger";
import { RiskSimulator } from "@/components/dashboard/RiskSimulator";

export default function Dashboard() {
  const currentMonth = LOAN_DATA.monthlyHistory[LOAN_DATA.monthlyHistory.length - 1];
  const rateCalculation = calculateCurrentRate(currentMonth);

  // Live Risk Simulator state - managed by RiskSimulator component
  const [simulationResult, setSimulationResult] = useState<{
    new_interest_rate: number;
    risk_score: number;
    audit_hash: string;
    is_compliant: boolean;
    message: string;
  } | null>(null);
  const [simulatedData, setSimulatedData] = useState({
    ebitda: currentMonth.ebitda,
    debt: currentMonth.debt,
    carbon: currentMonth.carbonEmissions,
  });

  // Calculate rates for all months and add notes
  const monthlyDataWithRates = useMemo(() => {
    return LOAN_DATA.monthlyHistory.map((month, index) => {
      const calc = calculateCurrentRate(month);
      const prevCalc = index > 0 ? calculateCurrentRate(LOAN_DATA.monthlyHistory[index - 1]) : null;

      let notes = "";
      if (prevCalc && calc.finalRate !== prevCalc.finalRate) {
        if (calc.finalRate < prevCalc.finalRate) {
          notes = "ESG Discount Applied";
        } else if (calc.finalRate > prevCalc.finalRate) {
          notes = "ESG Penalty Applied";
        }
      }
      if (!month.financialCovenantMet) {
        notes = "BREACH: Financial Covenant Violated";
      }

      return {
        ...month,
        rateApplied: calc.finalRate,
        notes: notes || "Normal Operations",
      };
    });
  }, []);

  const handleSimulationComplete = (
    result: {
      new_interest_rate: number;
      risk_score: number;
      audit_hash: string;
      is_compliant: boolean;
      message: string;
    },
    data: { ebitda: number; debt: number; carbon: number }
  ) => {
    setSimulationResult(result);
    setSimulatedData(data);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <LoanHeader />

      <div className="container mx-auto p-6 space-y-6">
        <LoanSummary currentMonth={currentMonth} />
        <LiveRateCards currentMonth={currentMonth} rateCalculation={rateCalculation} />
        <CovenantCharts />
        <CovenantLedger monthlyDataWithRates={monthlyDataWithRates} />
        <RiskSimulator
          initialData={currentMonth}
          onSimulationComplete={handleSimulationComplete}
        />
        <LoanAnalyst simulationResult={simulationResult} simulatedData={simulatedData} />
      </div>
    </div>
  );
}

