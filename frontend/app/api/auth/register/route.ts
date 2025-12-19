import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sanitizeInput, sanitizeEmail, rateLimit, getClientIP } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import { generateVerificationEmail } from "@/lib/email-templates";
import { logAudit, getRequestMetadata } from "@/lib/audit";
import { env } from "@/lib/env";
import crypto from "crypto";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "CREDIT_OFFICER", "BORROWER"]).optional(),
  organizationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (3 registrations per hour per IP)
    const clientIP = getClientIP(request);
    const rateLimitKey = `register:${clientIP}`;
    if (!rateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Sanitize inputs
    if (body.name) body.name = sanitizeInput(body.name);
    if (body.email) body.email = sanitizeEmail(body.email);
    
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role || "BORROWER",
        organizationId: validatedData.organizationId,
        emailVerified: false, // Require email verification
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    // Create verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expires,
      },
    });

    // Send verification email
    const verificationUrl = `${env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    const emailTemplate = generateVerificationEmail(verificationUrl, user.name || undefined);

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // Log audit event
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await logAudit({
      userId: user.id,
      action: "CREATE",
      resource: "USER",
      resourceId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          ...user,
          emailVerified: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

