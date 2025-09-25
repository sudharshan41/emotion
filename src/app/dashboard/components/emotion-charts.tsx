"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

const chartConfig = {
  emotions: {
    label: "Emotions",
  },
  Neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-1))",
  },
  Happy: {
    label: "Happy",
    color: "hsl(var(--chart-2))",
  },
  Stressed: {
    label: "Stressed",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

type EmotionChartsProps = {
  emotionDistribution: any[];
  emotionOverTime: any[];
};

export function EmotionCharts({ emotionDistribution, emotionOverTime }: EmotionChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Emotion Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={emotionOverTime}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 5)}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    label={{ value: 'Intensity', angle: -90, position: 'insideLeft', offset: -5 }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="Happy"
                  type="monotone"
                  stroke="var(--color-Happy)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="Neutral"
                  type="monotone"
                  stroke="var(--color-Neutral)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="Stressed"
                  type="monotone"
                  stroke="var(--color-Stressed)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={emotionDistribution} layout="vertical" margin={{ left: 10 }}>
                <YAxis
                  dataKey="emotion"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                  className="capitalize"
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent layout="horizontal" />}
                />
                <Bar dataKey="count" layout="vertical" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
  );
}
