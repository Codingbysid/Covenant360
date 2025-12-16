import { MonthlyData, LOAN_DATA } from "./mockData";

export interface RateCalculationResult {
  finalRate: number;
  status: string;
  breakdown: {
    baseRate: number;
    baseMargin: number;
    sustainabilityDiscount?: number;
    sustainabilityPenalty?: number;
    defaultRiskPremium?: number;
  };
}

export function calculateCurrentRate(monthData: MonthlyData): RateCalculationResult {
  const { baseRate, baseMargin } = LOAN_DATA;
  let currentRate = baseRate + baseMargin;
  const breakdown: RateCalculationResult["breakdown"] = {
    baseRate,
    baseMargin,
  };
  let status = "NORMAL";

  // ESG Target Check
  if (monthData.esgTargetMet) {
    const sustainabilityDiscount = 0.10;
    currentRate -= sustainabilityDiscount;
    breakdown.sustainabilityDiscount = sustainabilityDiscount;
    status = "ESG_DISCOUNT_APPLIED";
  } else {
    const sustainabilityPenalty = 0.05;
    currentRate += sustainabilityPenalty;
    breakdown.sustainabilityPenalty = sustainabilityPenalty;
    status = "ESG_PENALTY_APPLIED";
  }

  // Financial Covenant Check
  if (!monthData.financialCovenantMet) {
    const defaultRiskPremium = 2.00;
    currentRate += defaultRiskPremium;
    breakdown.defaultRiskPremium = defaultRiskPremium;
    status = "BREACH";
  }

  return {
    finalRate: Math.round(currentRate * 100) / 100,
    status,
    breakdown,
  };
}

export function getStatusMessage(status: string): string {
  switch (status) {
    case "ESG_DISCOUNT_APPLIED":
      return "Rate Reduced: ESG Target Met";
    case "ESG_PENALTY_APPLIED":
      return "Rate Increased: ESG Target Missed";
    case "BREACH":
      return "BREACH: Financial Covenant Violated";
    default:
      return "Normal Operations";
  }
}

