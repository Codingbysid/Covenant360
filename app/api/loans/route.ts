import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sanitizeInput, rateLimit, getClientIP } from "@/lib/security";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

const loanSchema = z.object({
  borrowerName: z.string().min(1).max(200),
  totalFacilityAmount: z.number().positive().max(1000000000000), // Max 1 trillion
  baseRate: z.number().min(0).max(50).optional(),
  baseMargin: z.number().min(0).max(50).optional(),
  organizationId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    if (!rateLimit(`loans:get:${clientIP}`, 100, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const loans = await prisma.loan.findMany({
      where: {
        organizationId: (user as any).organizationId || undefined,
      },
      include: {
        covenants: true,
        monthlyData: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and credit officers can create loans
    if (!["ADMIN", "CREDIT_OFFICER"].includes((user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    if (!rateLimit(`loans:post:${clientIP}`, 10, 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Sanitize inputs
    if (body.borrowerName) {
      body.borrowerName = sanitizeInput(body.borrowerName);
    }
    
    const validatedData = loanSchema.parse(body);

    const loan = await prisma.loan.create({
      data: {
        ...validatedData,
        currentRate: (validatedData.baseRate || 4.5) + (validatedData.baseMargin || 2.0),
        organizationId: validatedData.organizationId || (user as any).organizationId,
        covenants: {
          create: {
            maxLeverageRatio: 4.0,
            esgTarget: 200.0,
            sustainabilityDiscount: 0.15,
            sustainabilityPenalty: 0.05,
          },
        },
      },
      include: {
        covenants: true,
      },
    });

    return NextResponse.json({ loan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating loan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
