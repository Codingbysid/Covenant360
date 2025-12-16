"use client";

import { LOAN_DATA } from "@/lib/mockData";
import { calculateCurrentRate, getStatusMessage } from "@/lib/logic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { Download, Wifi, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const currentMonth = LOAN_DATA.monthlyHistory[LOAN_DATA.monthlyHistory.length - 1];
  const rateCalculation = calculateCurrentRate(currentMonth);
  
  // Live Risk Simulator state
  const [simulatedData, setSimulatedData] = useState({
    ebitda: currentMonth.ebitda,
    debt: currentMonth.debt,
    carbon: currentMonth.carbonEmissions,
  });
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    new_interest_rate: number;
    risk_score: number;
    audit_hash: string;
    is_compliant: boolean;
    message: string;
  } | null>(null);
  
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

  // Prepare chart data
  const leverageChartData = LOAN_DATA.monthlyHistory.map((month) => ({
    month: month.month.substring(0, 3),
    "Leverage Ratio": month.leverageRatio,
    "Limit": LOAN_DATA.covenants.financial.limit,
  }));

  const carbonChartData = LOAN_DATA.monthlyHistory.map((month) => ({
    month: month.month.substring(0, 3),
    "Carbon Emissions": month.carbonEmissions,
    "Target": LOAN_DATA.covenants.esg.target,
  }));

  const rateColor = rateCalculation.finalRate < 6.5 ? "text-emerald-400" : "text-rose-400";
  const financialStatus = currentMonth.financialCovenantMet ? "success" : "destructive";
  const esgStatus = currentMonth.esgTargetMet ? "success" : "warning";

  // Run simulation function
  const runSimulation = async () => {
    setSimulationLoading(true);
    setSimulationResult(null);
    
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

      const response = await fetch("http://localhost:8000/calculate-rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setSimulationResult(data);
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Failed to run simulation. Make sure the backend is running on port 8000.");
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Top Bar */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Covenant360</h1>
            <p className="text-sm text-slate-400">The Unified Operating System for Sustainability-Linked Loans</p>
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
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Loan Summary */}
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
              <CardTitle className="text-xl">
                ${(LOAN_DATA.totalFacilityAmount / 1000000).toFixed(0)}M
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Status</CardDescription>
              <CardTitle className="text-xl">
                <Badge variant={currentMonth.financialCovenantMet && currentMonth.esgTargetMet ? "success" : "warning"}>
                  {currentMonth.financialCovenantMet && currentMonth.esgTargetMet ? "COMPLIANT" : "MONITORING"}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Top Row: Live Interest Rate & Compliance Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Interest Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Live Interest Rate</CardTitle>
              <CardDescription>Current rate based on financial and ESG performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`text-6xl font-bold ${rateColor}`}>
                  {rateCalculation.finalRate.toFixed(2)}%
                </div>
                <div className="text-sm text-slate-400">
                  {getStatusMessage(rateCalculation.status)}
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div>Base Rate: {LOAN_DATA.baseRate}%</div>
                  <div>Base Margin: {LOAN_DATA.baseMargin}%</div>
                  {rateCalculation.breakdown.sustainabilityDiscount && (
                    <div className="text-emerald-400">
                      ESG Discount: -{rateCalculation.breakdown.sustainabilityDiscount}%
                    </div>
                  )}
                  {rateCalculation.breakdown.sustainabilityPenalty && (
                    <div className="text-rose-400">
                      ESG Penalty: +{rateCalculation.breakdown.sustainabilityPenalty}%
                    </div>
                  )}
                  {rateCalculation.breakdown.defaultRiskPremium && (
                    <div className="text-red-500">
                      Default Risk Premium: +{rateCalculation.breakdown.defaultRiskPremium}%
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Real-time covenant monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Financial Covenant</span>
                  <Badge variant={financialStatus}>
                    {currentMonth.financialCovenantMet ? "OK" : "BREACH"}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">
                  {LOAN_DATA.covenants.financial.name}: {currentMonth.leverageRatio.toFixed(2)}
                  {LOAN_DATA.covenants.financial.unit} / Limit: {LOAN_DATA.covenants.financial.limit}
                  {LOAN_DATA.covenants.financial.unit}
                </div>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm font-medium">ESG Target</span>
                  <Badge variant={esgStatus}>
                    {currentMonth.esgTargetMet ? "MET" : "MISSED"}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">
                  {LOAN_DATA.covenants.esg.name}: {currentMonth.carbonEmissions}
                  {LOAN_DATA.covenants.esg.unit} / Target: &lt; {LOAN_DATA.covenants.esg.target}
                  {LOAN_DATA.covenants.esg.unit}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: The Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Leverage Ratio Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Net Leverage Ratio</CardTitle>
              <CardDescription>Financial Health Over Time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={leverageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Leverage Ratio"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <ReferenceLine
                    y={LOAN_DATA.covenants.financial.limit}
                    label="Limit"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Carbon Emissions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Carbon Emissions</CardTitle>
              <CardDescription>ESG Performance Over Time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carbonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Carbon Emissions" fill="#f59e0b" />
                  <ReferenceLine
                    y={LOAN_DATA.covenants.esg.target}
                    label="Target"
                    stroke="#10b981"
                    strokeDasharray="5 5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Covenant Ledger */}
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
                      <span className={month.financialCovenantMet ? "text-emerald-400" : "text-rose-400"}>
                        {month.leverageRatio.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={month.esgTargetMet ? "text-emerald-400" : "text-rose-400"}>
                        {month.carbonEmissions}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">{month.rateApplied?.toFixed(2)}%</TableCell>
                    <TableCell className="text-xs text-slate-400">{month.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Live Risk Simulator */}
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

              {/* Results Section */}
              {simulationResult && (
                <div className="mt-6 p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                  <h3 className="text-lg font-semibold mb-4 text-slate-50">Simulation Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">New Interest Rate</Label>
                      <div className={`text-3xl font-bold ${
                        simulationResult.new_interest_rate < 6.5 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {simulationResult.new_interest_rate.toFixed(2)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Risk Score</Label>
                      <div className={`text-3xl font-bold ${
                        simulationResult.risk_score < 50 ? "text-emerald-400" : 
                        simulationResult.risk_score < 80 ? "text-yellow-400" : "text-rose-400"
                      }`}>
                        {simulationResult.risk_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {simulationResult.risk_score < 50 ? "Low Risk" : 
                         simulationResult.risk_score < 80 ? "Moderate Risk" : "High Risk"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Compliance Status</Label>
                      <Badge variant={simulationResult.is_compliant ? "success" : "destructive"} className="text-sm">
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

