"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LoanAnalystProps {
  simulationResult: {
    new_interest_rate: number;
    risk_score: number;
    audit_hash: string;
    is_compliant: boolean;
    message: string;
  } | null;
  simulatedData: {
    ebitda: number;
    debt: number;
    carbon: number;
  };
}

export function LoanAnalyst({ simulationResult, simulatedData }: LoanAnalystProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAnalyzedRef = useRef(false);

  // Auto-analyze when simulation result changes
  useEffect(() => {
    if (simulationResult && open && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true;
      analyzeSimulation();
    }
  }, [simulationResult, open]);

  // Reset analysis flag when simulation result changes
  useEffect(() => {
    hasAnalyzedRef.current = false;
  }, [simulationResult]);

  // Scroll to bottom when new messages arrive or typing state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const analyzeSimulation = () => {
    if (!simulationResult) return;

    const leverageRatio = simulatedData.debt / simulatedData.ebitda;
    const carbonTarget = 200;
    const carbonStatus = simulatedData.carbon < carbonTarget ? "met" : "missed";
    const riskLevel =
      simulationResult.risk_score < 50
        ? "low"
        : simulationResult.risk_score < 80
        ? "moderate"
        : "high";

    let analysis = `I've analyzed your new scenario. `;

    // Risk score analysis
    if (simulationResult.risk_score > 50) {
      analysis += `Your Risk Score is ${simulationResult.risk_score.toFixed(1)}/100 (${riskLevel} risk)`;
      if (simulatedData.ebitda < 40000000) {
        analysis += ` due to the lower EBITDA of $${(simulatedData.ebitda / 1000000).toFixed(1)}M`;
      }
      analysis += `. `;
    } else {
      analysis += `Your Risk Score is ${simulationResult.risk_score.toFixed(1)}/100 (${riskLevel} risk), indicating a strong financial position. `;
    }

    // Compliance analysis
    if (simulationResult.is_compliant) {
      analysis += `You remain compliant with both financial covenants and ESG targets. `;
    } else {
      if (leverageRatio > 4.0) {
        analysis += `⚠️ Financial covenant breach: Leverage ratio (${leverageRatio.toFixed(2)}x) exceeds the 4.0x limit. `;
      }
      if (simulatedData.carbon >= carbonTarget) {
        analysis += `⚠️ ESG target missed: Carbon emissions (${simulatedData.carbon} tons) exceed the ${carbonTarget} ton target. `;
      }
    }

    // Interest rate analysis
    analysis += `Your interest rate is ${simulationResult.new_interest_rate.toFixed(2)}%. `;
    if (simulationResult.new_interest_rate < 6.5) {
      analysis += `This is favorable compared to market rates.`;
    } else {
      analysis += `Consider improving your ESG performance or reducing leverage to lower this rate.`;
    }

    addMessage("assistant", analysis);
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    addMessage("user", userMessage);

    // Simulate typing delay
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(userMessage);
      addMessage("assistant", response);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Rate-related questions
    if (lowerMessage.includes("rate") || lowerMessage.includes("interest")) {
      if (simulationResult) {
        return `Your current interest rate is ${simulationResult.new_interest_rate.toFixed(2)}%. This is calculated as: Base Rate (4.5%) + Base Margin (2.0%) + adjustments based on ESG performance and risk. To lower your rate: 1) Meet ESG targets (reduces rate by 0.15%), 2) Maintain leverage ratio below 4.0x, 3) Keep risk score below 50.`;
      }
      return `The interest rate is calculated based on your financial health and ESG performance. Meeting ESG targets can reduce your rate by 0.15%, while missing them adds a 0.05% penalty. Financial covenant breaches can add up to 2.00% in default risk premium.`;
    }

    // Risk-related questions
    if (lowerMessage.includes("risk") || lowerMessage.includes("risk")) {
      if (simulationResult) {
        return `Your current risk score is ${simulationResult.risk_score.toFixed(1)}/100. This is calculated using volatility analysis of your EBITDA and cash flow patterns. A score below 50 indicates low risk, 50-80 is moderate, and above 80 is high risk. Your score suggests ${simulationResult.risk_score < 50 ? "strong" : simulationResult.risk_score < 80 ? "moderate" : "elevated"} default probability.`;
      }
      return `Risk scores are calculated using quantitative models that analyze EBITDA volatility, cash reserves, and financial trends. Lower volatility and higher cash reserves result in lower risk scores.`;
    }

    // ESG-related questions
    if (
      lowerMessage.includes("esg") ||
      lowerMessage.includes("carbon") ||
      lowerMessage.includes("sustainability")
    ) {
      return `ESG targets are critical for your loan. The carbon emissions target is 200 tons. Meeting this target reduces your interest rate by 0.15% (sustainability discount). Missing it adds a 0.05% penalty. Your current carbon emissions are ${simulatedData.carbon} tons, which is ${simulatedData.carbon < 200 ? "below" : "above"} the target.`;
    }

    // Compliance-related questions
    if (
      lowerMessage.includes("compliance") ||
      lowerMessage.includes("covenant") ||
      lowerMessage.includes("breach")
    ) {
      const leverageRatio = simulatedData.debt / simulatedData.ebitda;
      return `Compliance is monitored on two fronts: 1) Financial: Net Leverage Ratio must stay below 4.0x (yours is ${leverageRatio.toFixed(2)}x). 2) ESG: Carbon emissions must stay below 200 tons (yours is ${simulatedData.carbon} tons). ${simulationResult?.is_compliant ? "You are currently compliant." : "⚠️ You have compliance issues that need attention."}`;
    }

    // How to improve questions
    if (
      lowerMessage.includes("improve") ||
      lowerMessage.includes("lower") ||
      lowerMessage.includes("reduce") ||
          lowerMessage.includes("better")
    ) {
      return `To improve your loan terms: 1) **Reduce Carbon Emissions**: Get below 200 tons to unlock the 0.15% ESG discount. 2) **Lower Leverage**: Keep debt-to-EBITDA ratio below 4.0x. 3) **Increase EBITDA**: Higher and more stable EBITDA reduces volatility and risk score. 4) **Maintain Cash Reserves**: Strong cash position acts as a buffer against risk.`;
    }

    // Default response
    return `I'm here to help you understand your loan status. You can ask me about: interest rates, risk scores, ESG targets, compliance status, or how to improve your loan terms. Try asking "How do I lower my rate?" or "What's my risk score?"`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-emerald-600 hover:bg-emerald-700"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Sheet Panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-700">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-400" />
              Covenant360 AI Analyst
            </SheetTitle>
            <SheetDescription>
              Ask me anything about your loan status, risk, or compliance
            </SheetDescription>
          </SheetHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                  <p>Start a conversation to analyze your loan data</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                      message.role === "user"
                        ? "bg-slate-700 text-slate-50"
                        : "bg-slate-800 border border-blue-500/30 text-slate-50"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-blue-500/30 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                      <div
                        className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your loan status..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

