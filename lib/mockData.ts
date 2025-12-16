export interface MonthlyData {
  month: string;
  monthNumber: number;
  revenue: number;
  ebitda: number;
  debt: number;
  carbonEmissions: number;
  leverageRatio: number;
  esgTargetMet: boolean;
  financialCovenantMet: boolean;
  rateApplied?: number;
  notes?: string;
}

export interface LoanData {
  borrowerName: string;
  totalFacilityAmount: number;
  baseRate: number;
  baseMargin: number;
  covenants: {
    financial: {
      name: string;
      limit: number;
      unit: string;
    };
    esg: {
      name: string;
      target: number;
      unit: string;
    };
  };
  monthlyHistory: MonthlyData[];
}

export const LOAN_DATA: LoanData = {
  borrowerName: "EcoSteel Industries",
  totalFacilityAmount: 500000000, // $500M
  baseRate: 4.5,
  baseMargin: 2.0,
  covenants: {
    financial: {
      name: "Net Leverage Ratio",
      limit: 4.0,
      unit: "x",
    },
    esg: {
      name: "Carbon Intensity",
      target: 200,
      unit: "tons",
    },
  },
  monthlyHistory: [
    {
      month: "January",
      monthNumber: 1,
      revenue: 125000000,
      ebitda: 35000000,
      debt: 120000000,
      carbonEmissions: 180,
      leverageRatio: 3.43,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "February",
      monthNumber: 2,
      revenue: 128000000,
      ebitda: 36000000,
      debt: 118000000,
      carbonEmissions: 175,
      leverageRatio: 3.28,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "March",
      monthNumber: 3,
      revenue: 132000000,
      ebitda: 37000000,
      debt: 115000000,
      carbonEmissions: 170,
      leverageRatio: 3.11,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "April",
      monthNumber: 4,
      revenue: 135000000,
      ebitda: 38000000,
      debt: 112000000,
      carbonEmissions: 165,
      leverageRatio: 2.95,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "May",
      monthNumber: 5,
      revenue: 138000000,
      ebitda: 39000000,
      debt: 110000000,
      carbonEmissions: 160,
      leverageRatio: 2.82,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "June",
      monthNumber: 6,
      revenue: 140000000,
      ebitda: 40000000,
      debt: 108000000,
      carbonEmissions: 155,
      leverageRatio: 2.70,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "July",
      monthNumber: 7,
      revenue: 142000000,
      ebitda: 41000000,
      debt: 105000000,
      carbonEmissions: 150,
      leverageRatio: 2.56,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "August",
      monthNumber: 8,
      revenue: 145000000,
      ebitda: 42000000,
      debt: 103000000,
      carbonEmissions: 285, // Massive spike - breaches target
      leverageRatio: 2.45,
      esgTargetMet: false, // BREACH
      financialCovenantMet: true,
    },
    {
      month: "September",
      monthNumber: 9,
      revenue: 143000000,
      ebitda: 40500000,
      debt: 102000000,
      carbonEmissions: 195,
      leverageRatio: 2.52,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "October",
      monthNumber: 10,
      revenue: 141000000,
      ebitda: 40000000,
      debt: 100000000,
      carbonEmissions: 185,
      leverageRatio: 2.50,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "November",
      monthNumber: 11,
      revenue: 139000000,
      ebitda: 39500000,
      debt: 98000000,
      carbonEmissions: 175,
      leverageRatio: 2.48,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
    {
      month: "December",
      monthNumber: 12,
      revenue: 137000000,
      ebitda: 39000000,
      debt: 95000000,
      carbonEmissions: 170,
      leverageRatio: 2.44,
      esgTargetMet: true,
      financialCovenantMet: true,
    },
  ],
};

