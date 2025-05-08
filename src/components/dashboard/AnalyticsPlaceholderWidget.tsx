
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { BarChartBig, LineChart, PieChart } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import type { PatientsByConditionData } from '@/lib/dashboard-data';

interface AnalyticsPlaceholderWidgetProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  chartType?: 'bar' | 'line' | 'pie';
  data?: any[]; // Generic data for now
  chartConfig?: ChartConfig;
  dataKey?: string;
  categoryKey?: string;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function AnalyticsPlaceholderWidget({
  title,
  icon: Icon,
  description,
  chartType,
  data,
  chartConfig,
  dataKey = "count",
  categoryKey = "name"
}: AnalyticsPlaceholderWidgetProps) {

  const renderChart = () => {
    if (!data || data.length === 0 || !chartType) {
      return <p className="text-muted-foreground text-center py-8">No data available for this chart.</p>;
    }

    if (chartType === 'pie' && chartConfig) {
      return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey={categoryKey} hideLabel />} />
              <Pie data={data} dataKey={dataKey} nameKey={categoryKey} labelLine={false} /* label={({ percent }) => `${(percent * 100).toFixed(0)}%`} */ >
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey={categoryKey} />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }
    
    if (chartType === 'bar' && chartConfig) {
       return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={categoryKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                // tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey={dataKey} fill="var(--color-barData)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }

    return <p className="text-muted-foreground text-center py-8">Chart type not fully implemented or configured.</p>;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        {/* Placeholder for chart */}
        {/* <div className="w-full h-full border-2 border-dashed border-muted-foreground/50 rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Chart will be displayed here</p>
        </div> */}
        {renderChart()}
      </CardContent>
    </Card>
  );
}
