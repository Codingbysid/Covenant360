"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUpNumber } from "@/components/ui/count-up";
import { MonthlyData } from "@/lib/mockData";
import { calculateCurrentRate } from "@/lib/logic";
import { calculateRate } from "@/lib/api";

interface RiskSimulatorProps {
  initialData: MonthlyData;
  onSimulationComplete?: (
    result: {
      new_interest_rate: number;
      risk_score: number;
      audit_hash: string;
      is_compliant: boolean;
      message: string;
    },
    data: { ebitda: number; debt: number; carbon: number }
  ) => void;
}

export function RiskSimulator({ initialData, onSimulationComplete }: RiskSimulatorProps) {
  const [simulatedData, setSimulatedData] = useState({
    ebitda: initialData.ebitda,
    debt: initialData.debt,
    carbon: initialData.carbonEmissions,
  });
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<{
    new_interest_rate: number;
    risk_score: number;
    audit_hash: string;
    is_compliant: boolean;
    message: string;
  } | null>(null);
  const [showGlow, setShowGlow] = useState(false);
  const previousRateRef = useRef<number | null>(null);
  
  // Initialize previous rate with current rate
  useEffect(() => {
    if (previousRateRef.current === null) {
      previousRateRef.current = calculateCurrentRate(initialData).finalRate;
    }
  }, [initialData]);

  const runSimulation = async () => {
    setSimulationLoading(true);
    setSimulationResult(null);
    setSimulationError(null);

    try {
      // Calculate revenue estimate (simplified: EBITDA * 3.5x)
      const estimatedRevenue = simulatedData.ebitda * 3.5;

      const payload = {
        financial: {
          revenue: estimatedRevenue,
          ebitda: simulatedData.ebitda,
          debt: simulatedData.debt,
          cash_reserves: 0.0,
        },
        esg: {
          carbon_emissions: simulatedData.carbon,
          diversity_score: null,
        },
        month: "Simulation",
      };

      const data = await calculateRate(payload);
      setSimulationResult(data);
      
      // Check if rate is lower than previous/current rate for glow effect
      if (previousRateRef.current !== null && data.new_interest_rate < previousRateRef.current) {
        setShowGlow(true);
        setTimeout(() => setShowGlow(false), 2000);
      }
      previousRateRef.current = data.new_interest_rate;
      
      if (onSimulationComplete) {
        onSimulationComplete(data, simulatedData);
      }
    } catch (error) {
      console.error("Simulation error:", error);
      setSimulationError("Error connecting to Risk Engine");
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Live Risk Simulator
        </CardTitle>
        <CardDescription>
          Simulate interest rate and risk calculations with custom financial and ESG inputs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA ($)</Label>
              <Input
                id="ebitda"
                type="number"
                value={simulatedData.ebitda}
                onChange={(e) =>
                  setSimulatedData({
                    ...simulatedData,
                    ebitda: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter EBITDA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt">Debt ($)</Label>
              <Input
                id="debt"
                type="number"
                value={simulatedData.debt}
                onChange={(e) =>
                  setSimulatedData({
                    ...simulatedData,
                    debt: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter Debt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbon">Carbon Emissions (tons)</Label>
              <Input
                id="carbon"
                type="number"
                value={simulatedData.carbon}
                onChange={(e) =>
                  setSimulatedData({
                    ...simulatedData,
                    carbon: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter Carbon Emissions"
              />
            </div>
          </div>

          {/* Run Simulation Button */}
          <div className="space-y-2">
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={runSimulation}
                disabled={simulationLoading}
                className="w-full md:w-auto"
              >
              {simulationLoading ? (
                <>
                  <span className="mr-2">Running...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-50 border-t-transparent" />
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
            </motion.div>
            {simulationError && (
              <p className="text-sm text-red-400">{simulationError}</p>
            )}
          </div>

          {/* Results Section */}
          {simulationLoading ? (
            <div className="mt-6 p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <h3 className="text-lg font-semibold mb-4 text-slate-50">Simulation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : simulationResult ? (
            <div
              className={`mt-6 p-4 rounded-lg border border-slate-700 bg-slate-800/50 transition-all ${
                showGlow ? "animate-glow-green" : ""
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 text-slate-50">Simulation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">New Interest Rate</Label>
                  <div
                    className={`text-3xl font-bold tabular-nums tracking-tight ${
                      simulationResult.new_interest_rate < 6.5
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    <CountUpNumber
                      end={simulationResult.new_interest_rate}
                      decimals={2}
                      suffix="%"
                      duration={1.5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Risk Score</Label>
                  <div
                    className={`text-3xl font-bold tabular-nums tracking-tight ${
                      simulationResult.risk_score < 50
                        ? "text-emerald-400"
                        : simulationResult.risk_score < 80
                        ? "text-yellow-400"
                        : "text-rose-400"
                    }`}
                  >
                    <CountUpNumber
                      end={simulationResult.risk_score}
                      decimals={1}
                      duration={1.5}
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    {simulationResult.risk_score < 50
                      ? "Low Risk"
                      : simulationResult.risk_score < 80
                      ? "Moderate Risk"
                      : "High Risk"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Compliance Status</Label>
                  <Badge
                    variant={simulationResult.is_compliant ? "success" : "destructive"}
                    className="text-sm"
                  >
                    {simulationResult.is_compliant ? "COMPLIANT" : "NON-COMPLIANT"}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-xs text-slate-400">Message</Label>
                <p className="text-sm text-slate-300">{simulationResult.message}</p>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-xs text-slate-400">Audit Hash</Label>
                <p className="text-xs font-mono text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-700">
                  {simulationResult.audit_hash}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

