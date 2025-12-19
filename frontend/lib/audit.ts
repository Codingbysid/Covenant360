/**
 * Audit logging utility for financial transactions
 * Critical for compliance and security in financial applications
 */

import { prisma } from "./prisma";
import { NextRequest } from "next/server";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "LOGIN"
  | "LOGOUT"
  | "RATE_CALCULATION"
  | "PASSWORD_RESET"
  | "EMAIL_VERIFICATION"
  | "LOAN_SIMULATION";

export type AuditResource =
  | "LOAN"
  | "USER"
  | "COVENANT"
  | "TRANSACTION"
  | "MONTHLY_DATA"
  | "AUTH"
  | "SYSTEM";

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || undefined,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || undefined,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress || undefined,
        userAgent: data.userAgent || undefined,
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    // But log it for investigation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMetadata(request: NextRequest): {
  ipAddress: string;
  userAgent: string;
} {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const ipAddress = forwarded
    ? forwarded.split(",")[0].trim()
    : realIP
    ? realIP.trim()
    : "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  userId: string,
  action: "LOGIN" | "LOGOUT",
  request: NextRequest
): Promise<void> {
  const { ipAddress, userAgent } = getRequestMetadata(request);
  await logAudit({
    userId,
    action,
    resource: "AUTH",
    ipAddress,
    userAgent,
  });
}

/**
 * Log financial calculations (critical for audit trail)
 */
export async function logRateCalculation(
  userId: string | undefined,
  loanId: string,
  calculationDetails: {
    newRate: number;
    previousRate?: number;
    riskScore: number;
    isCompliant: boolean;
    auditHash: string;
  },
  request?: NextRequest
): Promise<void> {
  const metadata = request ? getRequestMetadata(request) : { ipAddress: undefined, userAgent: undefined };
  
  await logAudit({
    userId,
    action: "RATE_CALCULATION",
    resource: "LOAN",
    resourceId: loanId,
    details: calculationDetails,
    ...metadata,
  });
}

/**
 * Log loan operations
 */
export async function logLoanOperation(
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW",
  loanId: string,
  details?: Record<string, unknown>,
  request?: NextRequest
): Promise<void> {
  const metadata = request ? getRequestMetadata(request) : { ipAddress: undefined, userAgent: undefined };
  
  await logAudit({
    userId,
    action,
    resource: "LOAN",
    resourceId: loanId,
    details,
    ...metadata,
  });
}

/**
 * Get audit logs for a resource
 */
export async function getAuditLogs(
  resource: AuditResource,
  resourceId?: string,
  userId?: string,
  limit: number = 100
): Promise<Array<{
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}>> {
  return prisma.auditLog.findMany({
    where: {
      resource,
      ...(resourceId && { resourceId }),
      ...(userId && { userId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

