"""
Covenant360 Backend Configuration
Centralized constants and configuration values.
"""

# Historical EBITDA data for risk calculation
# This represents the loan's historical performance
HISTORICAL_EBITDA = [
    35000000,
    36000000,
    37000000,
    38000000,
    39000000,
    40000000,
    41000000,
    42000000,
    40500000,
    40000000,
    39500000,
]

# Loan Agreement Constants
BASE_RATE = 4.5
BASE_MARGIN = 2.0
ESG_TARGET = 200.0  # Carbon emissions target in tons

# Financial Covenant Limits
MAX_LEVERAGE_RATIO = 4.0

# Risk Model Constants
HIGH_RISK_THRESHOLD = 80
MODERATE_RISK_THRESHOLD = 50
LOW_RISK_THRESHOLD = 25

# Rate Adjustment Constants (matching smart_contract.py)
SUSTAINABILITY_DISCOUNT = 0.15
SUSTAINABILITY_PENALTY = 0.05
COV_LITE_PENALTY = 1.00
DEFAULT_RISK_PREMIUM = 2.00

