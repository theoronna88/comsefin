import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import LoadingComsefaz from "@/app/_components/comsefaz-loading";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartContainer,
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

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 pb-0">
        <h3 className="text-lg font-semibold text-center my-6 text-blue-900">
          {title || " "}
        </h3>
        {searching ? (
          <LoadingComsefaz width={150} height={150} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[500px] pb-32"
          >
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius="100%"
                  isAnimationActive={false}
                  label // <- habilita os labels padrão
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;
