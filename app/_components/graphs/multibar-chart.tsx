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

  const chartHeight = Math.max(400, chartData.length * 65);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <p>
            Total {year}:{" "}
            <span className="font-semibold text-[#2f5597]">
              {totalAtual.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>
          <p>
            Total {prevYear}:{" "}
            <span className="font-semibold text-[#afabab]">
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
          <ChartContainer
            config={chartConfig}
            className=" w-full"
            style={{ height: `${chartHeight}px` }}
          >
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
                    "R$ " + value.toLocaleString("pt-BR")
                  }
                />
                <YAxis
                  dataKey="categoria"
                  type="category"
                  width={170}
                  tick={(props) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { x, y, payload } = props;
                    const limit = 25;
                    const words = payload.value.split(" ");
                    const lines = [];
                    let currentLine = "";

                    words.forEach((word: string) => {
                      if ((currentLine + word).length > limit) {
                        lines.push(currentLine.trim());
                        currentLine = word + " ";
                      } else {
                        currentLine += word + " ";
                      }
                    });
                    lines.push(currentLine.trim());

                    return (
                      <g transform={`translate(10,${y})`}>
                        <text
                          x={0}
                          y={0}
                          fontSize={12}
                          className="fill-muted-foreground"
                          style={{ textRendering: "optimizeLegibility" }}
                        >
                          {lines.map((line, index) => {
                            return (
                              <tspan
                                x={0}
                                dy={
                                  index === 0 ? -((lines.length - 1) * 7) : 14
                                }
                                key={index}
                                textAnchor="start"
                              >
                                {line}
                              </tspan>
                            );
                          })}
                        </text>
                      </g>
                    );
                  }}
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
                  minPointSize={(value) => (value && value > 0 ? 5 : 0)}
                />
                <Bar
                  dataKey="anterior"
                  fill="var(--color-anterior)"
                  radius={[0, 4, 4, 0]}
                  name={String(prevYear)}
                  minPointSize={(value) => (value && value > 0 ? 5 : 0)}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
        {/* Legenda */}
        {year !== "" && (
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="block w-4 h-4 rounded-sm bg-[#2f5597]" />
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="block w-4 h-4 rounded-sm bg-[#afabab]" />
              <span>{prevYear}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiBarChart;
