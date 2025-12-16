"use client";

import Link from "next/link";
import { Shield, Zap, Brain, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              <Shield className="h-4 w-4" />
              <span>Bank-Grade Security & Compliance</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-50 md:text-6xl lg:text-7xl">
              The Operating System for
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Sustainability-Linked Loans
              </span>
            </h1>
            <p className="mb-8 text-xl text-slate-400 md:text-2xl">
              Real-time monitoring, AI-powered risk assessment, and immutable audit trails
              for the next generation of sustainable finance.
            </p>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/login" className="group">
                Launch Platform
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-b border-white/10 bg-slate-950/50 py-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-50 md:text-4xl">
              Built for Financial Institutions
            </h2>
            <p className="text-lg text-slate-400">
              Enterprise-grade features designed for compliance and performance
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-slate-50">Real-time Ratchets</CardTitle>
                <CardDescription className="text-slate-400">
                  Interest rates adjust automatically based on ESG performance and financial
                  covenants. Monitor compliance in real-time with IoT sensor integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-slate-50">AI Risk Engine</CardTitle>
                <CardDescription className="text-slate-400">
                  Advanced machine learning models analyze EBITDA volatility, cash flow
                  patterns, and ESG metrics to calculate precise risk scores and default
                  probabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Lock className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-slate-50">Immutable Audit Trail</CardTitle>
                <CardDescription className="text-slate-400">
                  Every calculation is cryptographically hashed and stored on-chain. Complete
                  transparency and auditability for regulators and stakeholders.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-b border-white/10 bg-slate-950/50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="mb-8 text-sm font-medium uppercase tracking-wider text-slate-400">
              Trusted by leading institutions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-slate-500">JPMorgan Chase</div>
              <div className="text-2xl font-bold text-slate-500">Goldman Sachs</div>
              <div className="text-2xl font-bold text-slate-500">Bank of America</div>
              <div className="text-2xl font-bold text-slate-500">Wells Fargo</div>
              <div className="text-2xl font-bold text-slate-500">Citigroup</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

