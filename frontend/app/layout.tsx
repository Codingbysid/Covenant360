import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/lib/monitoring";

export const metadata: Metadata = {
  title: "Covenant360 - The Unified Operating System for SLLs",
  description: "Real-time monitoring for Sustainability-Linked Loans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

