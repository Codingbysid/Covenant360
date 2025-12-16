import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

