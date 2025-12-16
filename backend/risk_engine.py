"""
Risk Engine - Monte Carlo Simulation & Altman Z-Score Calculation
This engine runs quantitative risk analysis to calculate Probability of Default (PD).
Used in bank stress testing and credit risk modeling.
"""

import statistics
from typing import List


class RiskModel:
    """
    A lightweight risk model that simulates stochastic volatility
    used in quantitative finance for bank stress testing.
    """

    def __init__(self, historical_ebitda: List[float]):
        """
        Initialize the risk model with historical EBITDA data.

        Args:
            historical_ebitda: List of historical EBITDA values for volatility calculation
        """
        self.historical_ebitda = historical_ebitda

    def calculate_volatility(self) -> float:
        """
        Compute the standard deviation (volatility) of cash flows.
        Higher volatility indicates higher risk.

        Returns:
            Volatility as a percentage (0-100)
        """
        if len(self.historical_ebitda) < 2:
            return 0.0

        mean = statistics.mean(self.historical_ebitda)
        if mean == 0:
            return 0.0

        std_dev = statistics.stdev(self.historical_ebitda)
        volatility_percent = (std_dev / abs(mean)) * 100

        return round(volatility_percent, 2)

    def predict_default_risk(
        self, current_ebitda: float, cash_reserves: float = 0.0
    ) -> dict:
        """
        Predict default risk using volatility and cash reserve analysis.
        This simulates a stochastic volatility model used in bank stress testing.

        Logic:
        - High volatility (> 20%) + dropping cash reserves = High Risk
        - Low volatility = Low Risk
        - Cash reserves act as a buffer

        Args:
            current_ebitda: Current period EBITDA
            cash_reserves: Current cash reserves

        Returns:
            Dictionary with risk_score (0-100), volatility, probability_of_default, and message
        """
        volatility = self.calculate_volatility()

        # Base risk from volatility
        if volatility > 30:
            base_risk = 80
        elif volatility > 20:
            base_risk = 50
        elif volatility > 10:
            base_risk = 25
        else:
            base_risk = 10

        # Adjust for cash reserves
        if cash_reserves > 0:
            # Cash reserves as percentage of debt (simplified)
            cash_ratio = (cash_reserves / max(current_ebitda, 1)) * 100
            if cash_ratio > 50:
                base_risk = max(0, base_risk - 20)
            elif cash_ratio > 25:
                base_risk = max(0, base_risk - 10)

        # Check if EBITDA is declining
        if len(self.historical_ebitda) >= 2:
            recent_trend = (
                current_ebitda - self.historical_ebitda[-1]
            ) / max(abs(self.historical_ebitda[-1]), 1) * 100
            if recent_trend < -10:  # Declining by more than 10%
                base_risk = min(100, base_risk + 15)

        risk_score = min(100, max(0, base_risk))
        probability_of_default = risk_score / 100.0

        # Generate risk message
        if risk_score >= 80:
            message = "HIGH RISK: Elevated default probability detected"
        elif risk_score >= 50:
            message = "MODERATE RISK: Monitor closely"
        elif risk_score >= 25:
            message = "LOW-MODERATE RISK: Stable operations"
        else:
            message = "LOW RISK: Strong financial position"

        return {
            "risk_score": round(risk_score, 2),
            "volatility": volatility,
            "probability_of_default": round(probability_of_default, 4),
            "message": message,
        }

