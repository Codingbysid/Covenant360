"use client";

import { useRef } from "react";
import CountUp from "react-countup";
import { useInView } from "framer-motion";

interface CountUpProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUpNumber({
  end,
  decimals = 2,
  prefix = "",
  suffix = "",
  duration = 2,
  className,
}: CountUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <span ref={ref} className={className}>
      {isInView && (
        <CountUp
          start={0}
          end={end}
          decimals={decimals}
          duration={duration}
          prefix={prefix}
          suffix={suffix}
        />
      )}
      {!isInView && (
        <span>
          {prefix}
          {end.toFixed(decimals)}
          {suffix}
        </span>
      )}
    </span>
  );
}

