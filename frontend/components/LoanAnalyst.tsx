"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, TrendingDown, ShieldAlert, FileText } from "lucide-react";
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
  const [typingMessage, setTypingMessage] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAnalyzedRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Suggested Prompts Configuration
  const QUICK_PROMPTS = [
    { label: "Why did my rate change?", icon: TrendingDown, prompt: "Why did my interest rate change?" },
    { label: "How to fix compliance?", icon: ShieldAlert, prompt: "How can I get back into compliance?" },
    { label: "Explain ESG impact", icon: Sparkles, prompt: "How does ESG performance affect my loan?" },
  ];

  // Auto-analyze when simulation result changes
  useEffect(() => {
    if (simulationResult && open && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true;
      analyzeSimulation();
    }
  }, [simulationResult, open]);

  useEffect(() => {
    hasAnalyzedRef.current = false;
  }, [simulationResult]);

  useEffect(() => {
    if (!open) {
      setIsTyping(false);
      setTypingMessage("");
      setTypingIndex(0);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [open]);

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

    if (simulationResult.risk_score > 50) {
      analysis += `Your Risk Score is ${simulationResult.risk_score.toFixed(1)}/100 (${riskLevel} risk)`;
      if (simulatedData.ebitda < 40000000) {
        analysis += ` due to the lower EBITDA of $${(simulatedData.ebitda / 1000000).toFixed(1)}M`;
      }
      analysis += `. `;
    } else {
      analysis += `Your Risk Score is ${simulationResult.risk_score.toFixed(1)}/100 (${riskLevel} risk), indicating a strong financial position. `;
    }

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

    analysis += `Your interest rate is ${simulationResult.new_interest_rate.toFixed(2)}%. `;
    if (simulationResult.new_interest_rate < 6.5) {
      analysis += `This is favorable compared to market rates.`;
    } else {
      analysis += `Consider improving your ESG performance or reducing leverage to lower this rate.`;
    }

    addMessage("assistant", analysis);
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    if (role === "user") {
      const newMessage: Message = {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    } else {
      setIsTyping(true);
      setTypingMessage(content);
      setTypingIndex(0);
    }
  };

  const generateResponse = (userMessage: string): string => {
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

  // Typing effect hook
  useEffect(() => {
    if (isTyping && typingMessage && typingIndex < typingMessage.length) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingIndex((prev) => prev + 1);
      }, 20); // Sped up slightly to 20ms for better UX
    } else if (isTyping && typingMessage && typingIndex >= typingMessage.length) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: typingMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
      setTypingMessage("");
      setTypingIndex(0);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isTyping, typingMessage, typingIndex]);

  // Handle Quick Prompt Click
  const handleQuickPrompt = (prompt: string) => {
    if (isTyping) return;
    addMessage("user", prompt);
    const response = generateResponse(prompt);
    addMessage("assistant", response);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;
    const userMessage = inputValue.trim();
    setInputValue("");
    addMessage("user", userMessage);
    const response = generateResponse(userMessage);
    addMessage("assistant", response);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] z-50 bg-emerald-600 hover:bg-emerald-500 hover:scale-105 transition-all duration-300"
        size="icon"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l border-emerald-500/20 bg-slate-900/95 backdrop-blur-xl">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/10 bg-slate-900/50">
            <SheetTitle className="flex items-center gap-2 text-slate-50">
              <Bot className="h-5 w-5 text-emerald-400" />
              Covenant360 AI Analyst
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              Real-time advisory on risk & compliance
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <div ref={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.length === 0 && (
                  <div className="text-center text-slate-400 text-sm py-8 space-y-3">
                    <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Bot className="h-8 w-8 text-emerald-500/50" />
                    </div>
                    <p>I can analyze the current simulation results.</p>
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
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                        message.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-slate-800 border border-white/10 text-slate-200 rounded-bl-none"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className="text-[10px] text-slate-400/70 mt-2 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && typingMessage && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 border border-emerald-500/20 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <p className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed">
                        {typingMessage.substring(0, typingIndex)}
                        <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 align-middle animate-pulse" />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Quick Prompts Area */}
          <div className="px-4 pb-2">
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {QUICK_PROMPTS.map((qp, i) => (
                    <button
                        key={i}
                        onClick={() => handleQuickPrompt(qp.prompt)}
                        disabled={isTyping}
                        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-800 border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    >
                        <qp.icon className="h-3 w-3" />
                        {qp.label}
                    </button>
                ))}
             </div>
          </div>

          <div className="border-t border-white/10 p-4 bg-slate-900/50">
            <div className="flex gap-2 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 bg-slate-800/50 border-white/10 focus-visible:ring-emerald-500/50 pr-10"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 bg-emerald-600 hover:bg-emerald-500 rounded-md"
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
