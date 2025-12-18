import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// For NextAuth v5, we'll use a different approach
export async function getCurrentUser() {
  // This will be handled via session in the API route
  // Return null for now - session will be checked in each route
  return null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function hasRole(user: any, role: string) {
  return user?.role === role;
}

export function isAdmin(user: any) {
  return hasRole(user, "ADMIN");
}

export function isCreditOfficer(user: any) {
  return hasRole(user, "CREDIT_OFFICER");
}

export function isBorrower(user: any) {
  return hasRole(user, "BORROWER");
}

