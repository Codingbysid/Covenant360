import { LOAN_DATA } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "@/components/ui/chart-tooltip";

export function CovenantCharts() {
  // Prepare chart data
  const leverageChartData = LOAN_DATA.monthlyHistory.map((month) => ({
    month: month.month.substring(0, 3),
    "Leverage Ratio": month.leverageRatio,
    "Limit": LOAN_DATA.covenants.financial.limit,
  }));

  const carbonChartData = LOAN_DATA.monthlyHistory.map((month) => ({
    month: month.month.substring(0, 3),
    "Carbon Emissions": month.carbonEmissions,
    "Target": LOAN_DATA.covenants.esg.target,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Net Leverage Ratio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Net Leverage Ratio</CardTitle>
          <CardDescription>Financial Health Over Time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={leverageChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <ReferenceArea
                y1={LOAN_DATA.covenants.financial.limit}
                y2={10}
                fill="#ef4444"
                fillOpacity={0.1}
                stroke="#ef4444"
                strokeOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="Leverage Ratio"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <ReferenceLine
                y={LOAN_DATA.covenants.financial.limit}
                label="Limit"
                stroke="#ef4444"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Carbon Emissions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Carbon Emissions</CardTitle>
          <CardDescription>ESG Performance Over Time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carbonChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="Carbon Emissions" fill="#f59e0b" />
              <ReferenceLine
                y={LOAN_DATA.covenants.esg.target}
                label="Target"
                stroke="#10b981"
                strokeDasharray="5 5"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

