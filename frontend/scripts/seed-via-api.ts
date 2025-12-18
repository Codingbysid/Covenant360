/**
 * Alternative seed script that uses API endpoints
 * Run this after the server is running: npm run dev
 * Then in another terminal: npm run db:seed:api
 */

import bcrypt from "bcryptjs";

const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function seedViaAPI() {
  console.log("Seeding database via API endpoints...\n");

  const users = [
    {
      email: "admin@bank.com",
      password: "admin123",
      name: "Admin User",
      role: "ADMIN",
    },
    {
      email: "credit_officer@bank.com",
      password: "officer123",
      name: "Credit Officer",
      role: "CREDIT_OFFICER",
    },
    {
      email: "borrower@company.com",
      password: "borrower123",
      name: "Borrower User",
      role: "BORROWER",
    },
  ];

  for (const user of users) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        console.log(`✅ Created user: ${user.email}`);
      } else {
        const error = await response.json();
        if (error.error?.includes("already exists")) {
          console.log(`⏭️  User already exists: ${user.email}`);
        } else {
          console.log(`❌ Failed to create ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.email}:`, error);
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log("\nYou can now log in with:");
  console.log("- admin@bank.com / admin123");
  console.log("- credit_officer@bank.com / officer123");
  console.log("- borrower@company.com / borrower123");
}

seedViaAPI().catch(console.error);

