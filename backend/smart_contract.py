"""
Digital Loan Agreement - Smart Legal Contract
This represents the 'Digital Twin' of the loan agreement.
It enforces rules immutably and generates SHA-256 hashes for audit trail.
Simulates blockchain-lite behavior for immutable ledger.
"""

import hashlib
import json
from datetime import datetime
from typing import Dict, List
from config import (
    SUSTAINABILITY_DISCOUNT,
    SUSTAINABILITY_PENALTY,
    COV_LITE_PENALTY,
)


class DigitalLoanAgreement:
    """
    A smart contract that enforces loan terms and calculates interest rates
    based on financial and ESG performance. Generates immutable audit trail.
    """

    def __init__(
        self,
        base_rate: float = 5.0,
        margin: float = 2.0,
        esg_target: float = 200.0,
    ):
        """
        Initialize the digital loan agreement with contract terms.

        Args:
            base_rate: Base interest rate (e.g., 5.0%)
            margin: Base margin (e.g., 2.0%)
            esg_target: ESG target threshold (e.g., 200 tons carbon)
        """
        self.base_rate = base_rate
        self.margin = margin
        self.esg_target = esg_target
        self.audit_chain: List[str] = []  # Immutable ledger of transactions

    def execute_ratchet(
        self,
        current_financials: Dict,
        current_esg: Dict,
        risk_score: float = 0.0,
    ) -> Dict:
        """
        Execute the margin ratchet based on current performance.
        This is the core logic that determines the interest rate.

        Args:
            current_financials: Dictionary with financial metrics (ebitda, debt, etc.)
            current_esg: Dictionary with ESG metrics (carbon_emissions, etc.)
            risk_score: Risk score from Risk Engine (0-100)

        Returns:
            Dictionary with new_rate, date, reason, and audit_hash
        """
        # Start with base rate + margin
        new_rate = self.base_rate + self.margin
        reasons = []

        # ESG Target Check
        carbon_emissions = current_esg.get("carbon_emissions", 0)
        if carbon_emissions < self.esg_target:
            new_rate -= SUSTAINABILITY_DISCOUNT
            reasons.append(
                f"Sustainability Discount Applied: -{SUSTAINABILITY_DISCOUNT}% (ESG Target Met)"
            )
        else:
            new_rate += SUSTAINABILITY_PENALTY
            reasons.append(
                f"Sustainability Penalty Applied: +{SUSTAINABILITY_PENALTY}% (ESG Target Missed)"
            )

        # Risk-based adjustment (Cov-Lite Breach)
        if risk_score > 80:
            new_rate += COV_LITE_PENALTY
            reasons.append(
                f"Cov-Lite Breach: +{COV_LITE_PENALTY}% (High Default Risk)"
            )

        # Round to 2 decimal places
        new_rate = round(new_rate, 2)

        # Create transaction record
        transaction = {
            "new_rate": new_rate,
            "date": datetime.now().isoformat(),
            "reason": "; ".join(reasons),
            "financials": current_financials,
            "esg": current_esg,
            "risk_score": risk_score,
        }

        # Generate SHA-256 hash (blockchain-lite behavior)
        transaction_json = json.dumps(transaction, sort_keys=True)
        audit_hash = hashlib.sha256(transaction_json.encode()).hexdigest()

        # Add to immutable audit chain
        self.audit_chain.append(audit_hash)

        return {
            "new_rate": new_rate,
            "date": transaction["date"],
            "reason": transaction["reason"],
            "audit_hash": audit_hash,
        }

    def get_audit_chain(self) -> List[str]:
        """
        Get the complete audit chain (immutable ledger).

        Returns:
            List of SHA-256 hashes representing all transactions
        """
        return self.audit_chain.copy()

