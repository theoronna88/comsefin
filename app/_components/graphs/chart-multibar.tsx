import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardTitle } from "../ui/card";
import { ChartContainer } from "../ui/chart";

interface ChartMultibarProps {
  title?: string;
  data: Array<{ [key: string]: string | number }>;
  chartConfig: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

const ChartMultibar = ({ title, chartConfig, data }: ChartMultibarProps) => {
  console.log("Renderizando ChartMultibar...");
  console.log("Título do gráfico:", title);
  console.log("Dados do gráfico:", data);
  console.log("Configuração do gráfico:", chartConfig);

  return (
    <Card>
      <CardContent className="h-[700px] ">
        <CardTitle></CardTitle>
        <ChartContainer config={chartConfig} className="min-h-[700px] w-full">
          <div>
            <h3 className="text-lg font-semibold text-center my-6 text-blue-900 ">
              {title}
            </h3>

            <ResponsiveContainer width="100%" height={700}>
              <BarChart
                accessibilityLayer
                data={data}
                margin={{ top: 0, right: 50, left: 50, bottom: 80 }}
              >
                <CartesianGrid
                  vertical={false}
                  horizontal={true}
                  stroke="#6b6869"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey={data[0]?.centro ? "centro" : "categoria"}
                  tick={{ fontSize: 14 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={200}
                />
                <YAxis
                  tick={{ fontSize: 14, fontWeight: "bold" }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />

                {chartConfig && Object.keys(chartConfig).length > 0 ? (
                  Object.entries(chartConfig).map(([key, config]) => (
                    <Bar key={key} dataKey={key} fill={config.color} />
                  ))
                ) : (
                  <></>
                )}
              </BarChart>
            </ResponsiveContainer>
            {/* Legenda fora do gráfico */}
            <div className="mt-6 flex justify-center gap-4 text-sm">
              {<></>}
            </div>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ChartMultibar;
