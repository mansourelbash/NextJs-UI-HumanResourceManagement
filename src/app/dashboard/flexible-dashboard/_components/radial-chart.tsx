"use client"
import { PolarGrid, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { labelResult } from "./form-crud"
type Props = {
    title: string,
    data: labelResult[],
    firstDescription: string,
    secondDescription: string,
}
const predefinedColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];
export function RadialChartCustom({ title, data, firstDescription, secondDescription }: Props) {    const chartConfig = data.reduce((config, item, index) => {
        config[item.label.toLowerCase()] = {
            label: item.label,
            color: predefinedColors[index % predefinedColors.length], // Loop colors if exceeding the list
        };
        return config;
    }, {} as ChartConfig);

    // Convert data to Recharts format
    const chartData = data.map((item) => ({
        name: item.label,
        value: item.value,
        fill: chartConfig[item.label.toLowerCase()]?.color || "hsl(var(--chart-default))",
    }));
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{firstDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <PolarGrid gridType="circle" />
            <RadialBar dataKey="value" />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {secondDescription}
        </div>
      </CardFooter>
    </Card>
  )
}
