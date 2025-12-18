import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, getClientIP } from "@/lib/security";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

const ingestSchema = z.object({
  loanId: z.string(),
  month: z.string(),
  financial: z.object({
    ebitda: z.number(),
    debt: z.number(),
    revenue: z.number().optional(),
    cashReserves: z.number().optional(),
  }),
  esg: z.object({
    carbonEmissions: z.number(),
    diversityScore: z.number().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (20 requests per minute per IP)
    const clientIP = getClientIP(request);
    if (!rateLimit(`ingest:${clientIP}`, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = ingestSchema.parse(body);

    // Calculate leverage ratio
    const leverageRatio = validatedData.financial.debt / validatedData.financial.ebitda;

    // Get loan covenants
    const loan = await prisma.loan.findUnique({
      where: { id: validatedData.loanId },
      include: { covenants: true },
    });

    if (!loan || !loan.covenants) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const financialCovenantMet = leverageRatio < loan.covenants.maxLeverageRatio;
    const esgTargetMet = validatedData.esg.carbonEmissions < loan.covenants.esgTarget;

    // Calculate rate (simplified - you can call your backend API here)
    let rate = loan.baseRate + loan.baseMargin;
    if (esgTargetMet) {
      rate -= loan.covenants.sustainabilityDiscount;
    } else {
      rate += loan.covenants.sustainabilityPenalty;
    }

    // Create monthly data entry
    const monthlyData = await prisma.monthlyData.create({
      data: {
        loanId: validatedData.loanId,
        month: validatedData.month,
        ebitda: validatedData.financial.ebitda,
        debt: validatedData.financial.debt,
        revenue: validatedData.financial.revenue || validatedData.financial.ebitda * 3.5,
        cashReserves: validatedData.financial.cashReserves || 0,
        carbonEmissions: validatedData.esg.carbonEmissions,
        leverageRatio,
        rateApplied: rate,
        financialCovenantMet,
        esgTargetMet,
      },
    });

    // Update loan current rate
    await prisma.loan.update({
      where: { id: validatedData.loanId },
      data: { currentRate: rate },
    });

    // Check for breaches and create notifications
    if (!financialCovenantMet || !esgTargetMet) {
      const breachType = !financialCovenantMet
        ? "Financial Covenant"
        : "ESG Target";
      const details = !financialCovenantMet
        ? `Leverage ratio ${leverageRatio.toFixed(2)}x exceeds limit of ${loan.covenants.maxLeverageRatio}x`
        : `Carbon emissions ${validatedData.esg.carbonEmissions} tons exceed target of ${loan.covenants.esgTarget} tons`;

      // Trigger breach notification
      await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/breach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: validatedData.loanId,
          breachType,
          details,
        }),
      });
    }

    return NextResponse.json(
      { success: true, monthlyData },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error ingesting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

