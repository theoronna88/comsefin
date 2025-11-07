import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "../ui/card";
import LoadingComsefaz from "../comsefaz-loading";
import { ChartContainer } from "../ui/chart";

interface MultiBarChartProps {
  chartData: Array<{
    centro: string;
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
  // console.log("MultiBarChart - chartData: ", chartData);
  return (
    <>
      <Card>
        <CardContent className="h-[500px]">
          {searching ? (
            <LoadingComsefaz width={150} height={150} />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full"
            >
              <div className="">
                {/* Título */}
                <h3 className="text-lg font-semibold text-center my-6 text-blue-900 ">
                  {title}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ top: 20, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="centro"
                      tickLine={false}
                      angle={30}
                      textAnchor="start"
                      tickMargin={20}
                      interval={0}
                      axisLine={false}
                      height={100}
                    />
                    <YAxis />

                    <Bar dataKey="atual" fill="var(--color-atual)" radius={4} />
                    <Bar
                      dataKey="anterior"
                      fill="var(--color-anterior)"
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
                {/* Legenda fora do gráfico */}
                <div className="mt-6 flex justify-center gap-4 text-sm">
                  {year !== "" ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="block w-4 h-4 bg-[var(--color-atual)] rounded-sm" />
                        <span className="text-blue-900">{year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="block w-4 h-4 bg-[var(--color-anterior)] rounded-sm" />
                        <span className="text-blue-900">{prevYear}</span>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default MultiBarChart;
