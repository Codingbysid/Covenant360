"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOAN_DATA } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RateCalculationResult, getStatusMessage } from "@/lib/logic";
import { MonthlyData } from "@/lib/mockData";
import { CountUpNumber } from "@/components/ui/count-up";

interface LiveRateCardsProps {
  currentMonth: MonthlyData;
  rateCalculation: RateCalculationResult;
}

export function LiveRateCards({ currentMonth, rateCalculation }: LiveRateCardsProps) {
  const rateColor = rateCalculation.finalRate < 6.5 ? "text-emerald-400" : "text-rose-400";
  const financialStatus = currentMonth.financialCovenantMet ? "success" : "destructive";
  const esgStatus = currentMonth.esgTargetMet ? "success" : "warning";
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [prevRate, setPrevRate] = useState(rateCalculation.finalRate);

  useEffect(() => {
    if (prevRate !== rateCalculation.finalRate) {
      // Flash green for rate decrease, red for increase
      const color = rateCalculation.finalRate < prevRate ? "emerald" : "rose";
      setFlashColor(color);
      setTimeout(() => setFlashColor(null), 1000);
      setPrevRate(rateCalculation.finalRate);
    }
  }, [rateCalculation.finalRate, prevRate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Live Interest Rate */}
      <motion.div
        animate={{
          backgroundColor:
            flashColor === "emerald"
              ? "rgba(16, 185, 129, 0.1)"
              : flashColor === "rose"
              ? "rgba(244, 63, 94, 0.1)"
              : "transparent",
        }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 opacity-20 ${
            rateCalculation.finalRate < 6.5
              ? "bg-gradient-radial from-emerald-500/30 to-transparent"
              : "bg-gradient-radial from-rose-500/30 to-transparent"
          }`}
        />
        <CardHeader className="relative z-10">
          <CardTitle>Live Interest Rate</CardTitle>
          <CardDescription>Current rate based on financial and ESG performance</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <div className={`text-6xl font-bold tabular-nums tracking-tight ${rateColor}`}>
              <CountUpNumber
                end={rateCalculation.finalRate}
                decimals={2}
                suffix="%"
                duration={1.5}
              />
            </div>
            <div className="text-sm text-slate-400">
              {getStatusMessage(rateCalculation.status)}
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="tabular-nums">Base Rate: {LOAN_DATA.baseRate}%</div>
              <div className="tabular-nums">Base Margin: {LOAN_DATA.baseMargin}%</div>
              {rateCalculation.breakdown.sustainabilityDiscount && (
                <div className="text-emerald-400 tabular-nums">
                  ESG Discount: -{rateCalculation.breakdown.sustainabilityDiscount}%
                </div>
              )}
              {rateCalculation.breakdown.sustainabilityPenalty && (
                <div className="text-rose-400 tabular-nums">
                  ESG Penalty: +{rateCalculation.breakdown.sustainabilityPenalty}%
                </div>
              )}
              {rateCalculation.breakdown.defaultRiskPremium && (
                <div className="text-red-500 tabular-nums">
                  Default Risk Premium: +{rateCalculation.breakdown.defaultRiskPremium}%
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Real-time covenant monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Financial Covenant</span>
              <Badge variant={financialStatus}>
                {currentMonth.financialCovenantMet ? "OK" : "BREACH"}
              </Badge>
            </div>
            <div className="text-xs text-slate-400 tabular-nums">
              {LOAN_DATA.covenants.financial.name}: {currentMonth.leverageRatio.toFixed(2)}
              {LOAN_DATA.covenants.financial.unit} / Limit: {LOAN_DATA.covenants.financial.limit}
              {LOAN_DATA.covenants.financial.unit}
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm font-medium text-slate-300">ESG Target</span>
              <Badge variant={esgStatus}>
                {currentMonth.esgTargetMet ? "MET" : "MISSED"}
              </Badge>
            </div>
            <div className="text-xs text-slate-400 tabular-nums">
              {LOAN_DATA.covenants.esg.name}: {currentMonth.carbonEmissions}
              {LOAN_DATA.covenants.esg.unit} / Target: &lt; {LOAN_DATA.covenants.esg.target}
              {LOAN_DATA.covenants.esg.unit}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

