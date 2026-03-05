import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import LoadingComsefaz from "@/app/_components/comsefaz-loading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

interface PieChartProps {
  searching: boolean;
  chartConfig: Record<
    string,
    {
      label: string;
      color: string;
      value: number;
    }
  >;
  title?: string;
}

const PieChartCard = ({ searching, chartConfig, title }: PieChartProps) => {
  const chartData = Object.values(chartConfig).map((item) => ({
    label: item.label,
    fill: item.color,
    value: item.value,
  }));

  const totalGeral = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{title || " "}</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Total Geral:{" "}
          <span className="font-semibold text-primary">
            {totalGeral.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </p>
      </CardHeader>
      <CardContent>
        {searching ? (
          <LoadingComsefaz width={150} height={150} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[400px] w-1/2"
          >
            <ResponsiveContainer>
              <PieChart
                className="[&_.recharts-pie-label-text]:font-bold 
              [&_.recharts-sector]:stroke-white 
              [&_.recharts-sector]:stroke-2
              "
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        Number(value).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  labelLine={{ stroke: "#888", strokeWidth: 1 }}
                  label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="label" />}
                  className="-translate-y-2 flex-wrap items-start gap-y-2 justify-center"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;
