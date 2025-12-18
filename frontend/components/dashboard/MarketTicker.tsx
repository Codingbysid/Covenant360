"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  label: string;
  value: string;
  trend: "up" | "down";
}

const tickerData: TickerItem[] = [
  { label: "EURIBOR", value: "3.8%", trend: "up" },
  { label: "SONIA", value: "4.1%", trend: "down" },
  { label: "CARBON PRICE", value: "€85.50", trend: "up" },
  { label: "LIBOR", value: "4.2%", trend: "up" },
  { label: "SOFR", value: "4.0%", trend: "down" },
];

export function MarketTicker() {
  return (
    <div className="border-y border-white/5 bg-slate-900/30 backdrop-blur-md">
      <div className="container mx-auto overflow-hidden px-6 py-2">
        <motion.div
          className="flex gap-8"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {[...tickerData, ...tickerData].map((item, index) => (
            <div
              key={index}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm"
            >
              <span className="font-semibold text-slate-300">{item.label}</span>
              <span className="tabular-nums text-slate-50">{item.value}</span>
              {item.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-400" />
              )}
              {index < tickerData.length * 2 - 1 && (
                <span className="mx-4 text-slate-600">•</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

