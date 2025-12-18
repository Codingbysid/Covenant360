import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLoanReportPDF } from "@/lib/pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        monthlyData: {
          orderBy: { month: "asc" },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Get latest monthly data for current status
    const latestData = loan.monthlyData[loan.monthlyData.length - 1];

    const pdfData = {
      loanName: loan.borrowerName,
      borrowerName: loan.borrowerName,
      currentRate: loan.currentRate,
      totalFacilityAmount: loan.totalFacilityAmount,
      leverageRatio: latestData?.leverageRatio || 0,
      carbonEmissions: latestData?.carbonEmissions || 0,
      riskScore: latestData?.riskScore || 0,
      isCompliant: latestData
        ? latestData.financialCovenantMet && latestData.esgTargetMet
        : false,
      monthlyData: loan.monthlyData.map((m) => ({
        month: m.month,
        rate: m.rateApplied,
        leverageRatio: m.leverageRatio,
        carbonEmissions: m.carbonEmissions,
        compliant: m.financialCovenantMet && m.esgTargetMet,
      })),
    };

    const pdfBlob = generateLoanReportPDF(pdfData);

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="loan-report-${loan.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

