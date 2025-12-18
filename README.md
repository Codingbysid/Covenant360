# Covenant360

**The Unified Operating System for Sustainability-Linked Loans (SLLs)**

A production-grade SaaS application that unifies financial covenant tracking and ESG target monitoring for Sustainability-Linked Loans, automating the Margin Ratchet (interest rate adjustment) based on real-time performance.

## 🎯 Commercial Value Proposition

Sustainability-Linked Loans are complex. Banks currently track financial covenants (Credit Risk) and ESG targets (Sustainability Risk) in separate spreadsheets. This disconnect leads to:
- Manual errors
- Slow rate adjustments
- "Greenwashing" risks

Covenant360 unifies these data streams to automate the Margin Ratchet.

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion, React CountUp
- **Charts**: Recharts
- **Authentication**: NextAuth.js v5
- **Database ORM**: Prisma 7

### Backend (Python FastAPI)
- **Framework**: FastAPI
- **Risk Engine**: Monte Carlo Simulation & Altman Z-Score calculation
- **Smart Contract**: Digital Loan Agreement with SHA-256 audit trail

## 📁 Project Structure

```
Covenant360/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   │   ├── (public)/       # Public routes (landing, login)
│   │   ├── (protected)/    # Protected routes (dashboard, profile)
│   │   └── api/            # API routes
│   ├── components/          # React components
│   ├── lib/                # Utilities and helpers
│   ├── prisma/             # Database schema and migrations
│   ├── scripts/            # Database seeding scripts
│   └── package.json        # Node.js dependencies
├── backend/                 # Python FastAPI backend
│   ├── main.py            # FastAPI app and endpoints
│   ├── models.py          # Pydantic models
│   ├── risk_engine.py     # Risk calculation engine
│   ├── smart_contract.py  # Digital loan agreement
│   ├── config.py          # Configuration
│   ├── requirements.txt   # Python dependencies
│   └── run-backend.sh     # Backend startup script
├── README.md              # This file
└── SECURITY.md            # Security documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- SQLite (development) or PostgreSQL (production)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your NEXTAUTH_SECRET (generate with: openssl rand -base64 32)

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed:api

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

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
./run-backend.sh
# Or directly:
uvicorn main:app --reload --port 8000
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

### User Management
- Role-based access control (Admin, Credit Officer, Borrower)
- User profile management
- Secure authentication with NextAuth.js

## 🔧 API Endpoints

### Backend (FastAPI)

#### `GET /`
Health check endpoint

#### `GET /health`
Health check endpoint

#### `POST /calculate-rate`
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

#### `POST /calculate-risk`
Calculate risk score from historical EBITDA data

### Frontend (Next.js API Routes)

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - Authentication (NextAuth)
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create new loan
- `POST /api/data/ingest` - Ingest monthly data
- `GET /api/loans/[id]/report` - Generate PDF report
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password

## 🔐 Security

The application includes comprehensive security measures:
- Environment variable validation
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- CORS configuration
- Rate limiting on all API endpoints
- Input sanitization
- Password hashing with bcryptjs
- Role-based access control

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## 🎨 Design

- **Theme**: Dark, professional "FinTech" theme (slate/gray background)
- **Colors**: Deep slate blues (slate-900) for background, emerald/rose for data points
- **Style**: Bloomberg-style terminal UI with glassmorphism effects
- **Animations**: Framer Motion for smooth transitions and micro-interactions

## 🚀 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` - PostgreSQL connection string (use Vercel Postgres)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel domain
   - `API_BASE_URL` - Your backend API URL
3. Deploy!

### Backend Deployment

Deploy the FastAPI backend to any Python hosting service (Railway, Render, AWS, etc.) and update `API_BASE_URL` in frontend environment variables.

## 📝 License

ISC
