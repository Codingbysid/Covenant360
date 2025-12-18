"""
Covenant360 Backend API
FastAPI server for calculating interest rates based on financial and ESG data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    MonthlyDataRequest,
    RateCalculationResponse,
    RiskScoreResponse,
    HistoricalEBITDA,
)
from risk_engine import RiskModel
from smart_contract import DigitalLoanAgreement
from config import (
    HISTORICAL_EBITDA,
    BASE_RATE,
    BASE_MARGIN,
    ESG_TARGET,
    MAX_LEVERAGE_RATIO,
    HIGH_RISK_THRESHOLD,
)

app = FastAPI(
    title="Covenant360 API",
    description="The Unified Operating System for Sustainability-Linked Loans",
    version="1.0.0",
)

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Covenant360 API is running",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Covenant360 API"}


@app.post("/calculate-rate", response_model=RateCalculationResponse)
async def calculate_rate(request: MonthlyDataRequest):
    """
    Calculate the current interest rate based on financial and ESG data.

    This endpoint:
    1. Initializes the RiskModel to get the risk score
    2. Passes that score into the DigitalLoanAgreement
    3. Returns the new interest rate with audit hash

    Args:
        request: MonthlyDataRequest with financial and ESG data

    Returns:
        RateCalculationResponse with new_interest_rate, risk_score, is_compliant, audit_hash, and message
    """
    try:
        # Use historical EBITDA from config, append current EBITDA
        historical_ebitda = HISTORICAL_EBITDA + [request.financial.ebitda]

        # Initialize Risk Model
        risk_model = RiskModel(historical_ebitda)
        risk_result = risk_model.predict_default_risk(
            current_ebitda=request.financial.ebitda,
            cash_reserves=request.financial.cash_reserves or 0.0,
        )

        # Initialize Digital Loan Agreement with config values
        loan_agreement = DigitalLoanAgreement(
            base_rate=BASE_RATE,
            margin=BASE_MARGIN,
            esg_target=ESG_TARGET,
        )

        # Execute ratchet
        contract_result = loan_agreement.execute_ratchet(
            current_financials={
                "ebitda": request.financial.ebitda,
                "debt": request.financial.debt,
                "revenue": request.financial.revenue,
            },
            current_esg={
                "carbon_emissions": request.esg.carbon_emissions,
            },
            risk_score=risk_result["risk_score"],
        )

        # Determine compliance
        leverage_ratio = (
            request.financial.debt / request.financial.ebitda
            if request.financial.ebitda > 0
            else 0
        )
        is_compliant = (
            leverage_ratio <= MAX_LEVERAGE_RATIO
            and request.esg.carbon_emissions < ESG_TARGET
            and risk_result["risk_score"] < HIGH_RISK_THRESHOLD
        )

        # Generate message
        messages = []
        if request.esg.carbon_emissions < ESG_TARGET:
            messages.append("Rate Reduced: ESG Target Met")
        else:
            messages.append("Rate Increased: ESG Target Missed")

        if risk_result["risk_score"] > HIGH_RISK_THRESHOLD:
            messages.append("High Default Risk Detected")

        if not is_compliant:
            messages.append("Compliance Breach")

        message = ". ".join(messages) if messages else "Normal Operations"

        return RateCalculationResponse(
            new_interest_rate=contract_result["new_rate"],
            risk_score=risk_result["risk_score"],
            is_compliant=is_compliant,
            audit_hash=contract_result["audit_hash"],
            message=message,
            breakdown={
                "base_rate": BASE_RATE,
                "margin": BASE_MARGIN,
                "risk_score": risk_result["risk_score"],
                "volatility": risk_result["volatility"],
                "probability_of_default": risk_result["probability_of_default"],
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating rate: {str(e)}")


@app.post("/calculate-risk", response_model=RiskScoreResponse)
async def calculate_risk(historical_data: HistoricalEBITDA):
    """
    Calculate risk score from historical EBITDA data.

    Args:
        historical_data: HistoricalEBITDA with list of EBITDA values

    Returns:
        RiskScoreResponse with risk metrics
    """
    try:
        if len(historical_data.ebitda_values) < 2:
            raise HTTPException(
                status_code=400, detail="Need at least 2 historical EBITDA values"
            )

        risk_model = RiskModel(historical_data.ebitda_values)
        current_ebitda = historical_data.ebitda_values[-1]
        result = risk_model.predict_default_risk(current_ebitda=current_ebitda)

        return RiskScoreResponse(
            risk_score=result["risk_score"],
            volatility=result["volatility"],
            probability_of_default=result["probability_of_default"],
            message=result["message"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating risk: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

