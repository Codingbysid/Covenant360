import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load environment variables
config();

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

// Note: Prisma 7 requires adapter, but for seeding we can use a workaround
// Create users via API registration endpoint instead, or downgrade to Prisma 6
// For now, this script will be commented out and we'll create users via API

// Temporary workaround: We'll create a manual seed via API calls
// Or you can manually register users via /api/auth/register endpoint

console.log("Prisma 7 requires adapter configuration for seed scripts.");
console.log("Please use the registration API to create users:");
console.log("POST /api/auth/register");
console.log("\nDemo credentials to create:");
console.log("- admin@bank.com / admin123 (ADMIN)");
console.log("- credit_officer@bank.com / officer123 (CREDIT_OFFICER)");
console.log("- borrower@company.com / borrower123 (BORROWER)");

// Export for potential API-based seeding
export {};

// Note: This script has Prisma 7 adapter issues
// Use scripts/seed-via-api.ts instead for seeding

async function main() {
  console.log("Seeding database...");
  
  // Import prisma client
  const { prisma } = await import("@/lib/prisma");

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { name: "Demo Bank" },
    update: {},
    create: {
      name: "Demo Bank",
    },
  });

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const officerPassword = await bcrypt.hash("officer123", 10);
  const borrowerPassword = await bcrypt.hash("borrower123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bank.com" },
    update: {},
    create: {
      email: "admin@bank.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      organizationId: organization.id,
    },
  });

  const creditOfficer = await prisma.user.upsert({
    where: { email: "credit_officer@bank.com" },
    update: {},
    create: {
      email: "credit_officer@bank.com",
      name: "Credit Officer",
      password: officerPassword,
      role: "CREDIT_OFFICER",
      organizationId: organization.id,
    },
  });

  const borrower = await prisma.user.upsert({
    where: { email: "borrower@company.com" },
    update: {},
    create: {
      email: "borrower@company.com",
      name: "Borrower User",
      password: borrowerPassword,
      role: "BORROWER",
      organizationId: organization.id,
    },
  });

  // Create demo loan
  const loan = await prisma.loan.upsert({
    where: { id: "demo-loan-1" },
    update: {},
    create: {
      id: "demo-loan-1",
      borrowerName: "GreenTech Industries",
      totalFacilityAmount: 50000000,
      baseRate: 4.5,
      baseMargin: 2.0,
      currentRate: 6.55,
      organizationId: organization.id,
      covenants: {
        create: {
          maxLeverageRatio: 4.0,
          esgTarget: 200.0,
          sustainabilityDiscount: 0.15,
          sustainabilityPenalty: 0.05,
        },
      },
    },
  });

  // Create monthly data
  const months = [
    { month: "January", ebitda: 35000000, debt: 100000000, carbon: 250 },
    { month: "February", ebitda: 36000000, debt: 102000000, carbon: 245 },
    { month: "March", ebitda: 37000000, debt: 103000000, carbon: 240 },
    { month: "April", ebitda: 38000000, debt: 103000000, carbon: 235 },
    { month: "May", ebitda: 39000000, debt: 103000000, carbon: 230 },
    { month: "June", ebitda: 40000000, debt: 103000000, carbon: 225 },
    { month: "July", ebitda: 41000000, debt: 103000000, carbon: 220 },
    { month: "August", ebitda: 42000000, debt: 103000000, carbon: 215 },
    { month: "September", ebitda: 40500000, debt: 103000000, carbon: 210 },
    { month: "October", ebitda: 40000000, debt: 103000000, carbon: 205 },
    { month: "November", ebitda: 39500000, debt: 103000000, carbon: 200 },
    { month: "December", ebitda: 40000000, debt: 103000000, carbon: 195 },
  ];

  for (const monthData of months) {
    const leverageRatio = monthData.debt / monthData.ebitda;
    const financialCovenantMet = leverageRatio < 4.0;
    const esgTargetMet = monthData.carbon < 200;

    await prisma.monthlyData.upsert({
      where: {
        id: `${loan.id}-${monthData.month}`,
      },
      update: {},
      create: {
        id: `${loan.id}-${monthData.month}`,
        loanId: loan.id,
        month: monthData.month,
        ebitda: monthData.ebitda,
        debt: monthData.debt,
        revenue: monthData.ebitda * 3.5,
        cashReserves: 50000000,
        carbonEmissions: monthData.carbon,
        leverageRatio,
        rateApplied: 6.55,
        financialCovenantMet,
        esgTargetMet,
        riskScore: 45.0,
      },
    });
  }

  console.log("Database seeded successfully!");
  console.log("\nDemo Users:");
  console.log("Admin: admin@bank.com / admin123");
  console.log("Credit Officer: credit_officer@bank.com / officer123");
  console.log("Borrower: borrower@company.com / borrower123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  });

