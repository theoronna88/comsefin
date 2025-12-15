import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import LoadingComsefaz from "../comsefaz-loading";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface MultiBarChartProps {
  chartData: Array<{
    categoria: string;
    atual: number;
    anterior: number;
  }>;
  chartConfig: {
    atual: {
      label: string;
      color: string;
    };
    anterior: {
      label: string;
      color: string;
    };
  };
  year: string;
  prevYear: number;
  searching: boolean;
  title: string;
}

const MultiBarChart = ({
  chartData,
  chartConfig,
  year,
  prevYear,
  searching,
  title,
}: MultiBarChartProps) => {
  const totalAtual = chartData.reduce((acc, item) => acc + item.atual, 0);
  const totalAnterior = chartData.reduce((acc, item) => acc + item.anterior, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <p>
            Total {year}:{" "}
            <span className="font-semibold text-primary">
              {totalAtual.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>
          <p>
            Total {prevYear}:{" "}
            <span className="font-semibold text-blue-400">
              {totalAnterior.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {searching ? (
          <LoadingComsefaz width={150} height={150} />
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    (value / 1000).toLocaleString("pt-BR") + "k"
                  }
                />
                <YAxis
                  dataKey="categoria"
                  type="category"
                  width={180}
                  tick={{ fontSize: 11 }}
                />
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
                <Bar
                  dataKey="atual"
                  fill="var(--color-atual)"
                  radius={[0, 4, 4, 0]}
                  name={year}
                />
                <Bar
                  dataKey="anterior"
                  fill="var(--color-anterior)"
                  radius={[0, 4, 4, 0]}
                  name={String(prevYear)}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
        {/* Legenda */}
        {year !== "" && (
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="block w-4 h-4 rounded-sm bg-[#2563eb]" />
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="block w-4 h-4 rounded-sm bg-[#60a5fa]" />
              <span>{prevYear}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiBarChart;
