from pydantic import BaseModel
from typing import List, Optional


class FinancialData(BaseModel):
    revenue: float
    ebitda: float
    debt: float
    cash_reserves: Optional[float] = 0.0


class ESGData(BaseModel):
    carbon_emissions: float
    diversity_score: Optional[float] = None


class MonthlyDataRequest(BaseModel):
    financial: FinancialData
    esg: ESGData
    month: str


class RiskScoreResponse(BaseModel):
    risk_score: float
    volatility: float
    probability_of_default: float
    message: str


class RateCalculationResponse(BaseModel):
    new_interest_rate: float
    risk_score: float
    is_compliant: bool
    audit_hash: str
    message: str
    breakdown: dict


class HistoricalEBITDA(BaseModel):
    ebitda_values: List[float]

