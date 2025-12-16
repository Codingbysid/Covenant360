import { TooltipProps } from "recharts";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
  }>;
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 backdrop-blur-md p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-200 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-300">
              {entry.name}: <span className="font-semibold text-slate-50 tabular-nums">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

