# Covenant360

**The Unified Operating System for Sustainability-Linked Loans (SLLs)**

A hackathon project that unifies financial covenant tracking and ESG target monitoring for Sustainability-Linked Loans, automating the Margin Ratchet (interest rate adjustment) based on real-time performance.

## 🎯 Commercial Value Proposition

Sustainability-Linked Loans are complex. Banks currently track financial covenants (Credit Risk) and ESG targets (Sustainability Risk) in separate spreadsheets. This disconnect leads to:
- Manual errors
- Slow rate adjustments
- "Greenwashing" risks

Covenant360 unifies these data streams to automate the Margin Ratchet.

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Components**: Custom Shadcn/ui components
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend (Python FastAPI)
- **Framework**: FastAPI
- **Risk Engine**: Monte Carlo Simulation & Altman Z-Score calculation
- **Smart Contract**: Digital Loan Agreement with SHA-256 audit trail

## 🚀 Getting Started

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
cd backend
python main.py
```

Or using uvicorn directly:
```bash
uvicorn backend.main:app --reload --port 8000
```

API will be available at [http://localhost:8000](http://localhost:8000)

API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📊 Key Features

### The "Twin-Twin" Dashboard
- Split-screen view showing Real-time Financial Health vs. ESG Performance side-by-side

### Live Covenant Monitoring
- Visual indicators (Green/Red) showing if the borrower is meeting their agreed targets
- Financial: "Debt to EBITDA < 4.0x"
- ESG: "Carbon Reduction > 5%"

### Automated Rate Engine
- Logic: Base Rate + Margin +/- ESG Adjustment
- Real-time interest rate calculation based on performance

### Audit Log
- Scrolling feed of events
- Example: "Oct 12: Margin decreased by 0.05% due to met Solar targets"

### Risk Engine (Backend)
- Lightweight Monte Carlo Simulation
- Altman Z-Score calculation
- Probability of Default (PD) percentage
- Early Warning System

### Digital Contract (Backend)
- Smart Legal Contract written in Python
- Enforces rules immutably
- SHA-256 hash of every transaction
- Blockchain-lite audit trail

## 📁 Project Structure

```
Loan Project/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── lib/                  # Utilities and logic
│   ├── mockData.ts      # Mock loan data
│   ├── logic.ts         # Rate calculation logic
│   └── utils.ts         # Utility functions
├── backend/              # Python FastAPI backend
│   ├── main.py          # FastAPI app and endpoints
│   ├── models.py        # Pydantic models
│   ├── risk_engine.py   # Risk calculation engine
│   └── smart_contract.py # Digital loan agreement
├── requirements.txt      # Python dependencies
└── package.json         # Node.js dependencies
```

## 🔧 API Endpoints

### `GET /`
Health check endpoint

### `GET /health`
Health check endpoint

### `POST /calculate-rate`
Calculate interest rate based on financial and ESG data

**Request Body:**
```json
{
  "financial": {
    "revenue": 145000000,
    "ebitda": 42000000,
    "debt": 103000000,
    "cash_reserves": 50000000
  },
  "esg": {
    "carbon_emissions": 285,
    "diversity_score": 75
  },
  "month": "August"
}
```

**Response:**
```json
{
  "new_interest_rate": 6.55,
  "risk_score": 45.2,
  "is_compliant": false,
  "audit_hash": "abc123...",
  "message": "Rate Increased: ESG Target Missed",
  "breakdown": {
    "base_rate": 4.5,
    "margin": 2.0,
    "risk_score": 45.2,
    "volatility": 12.5,
    "probability_of_default": 0.452
  }
}
```

### `POST /calculate-risk`
Calculate risk score from historical EBITDA data

## 🎨 Design

- **Theme**: Dark, professional "FinTech" theme (slate/gray background)
- **Colors**: Deep slate blues (slate-900) for background, emerald/rose for data points
- **Style**: Bloomberg-style terminal UI

## 📝 License

ISC

