"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
import { GrupoDespesa } from "@/app/_lib/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";

interface GruposDespesasChartProps {
  grupos: GrupoDespesa[];
  totaisDespesas: any[];
  searching: boolean;
  year: string;
}

export function GruposDespesasChart({
  grupos,
  totaisDespesas,
  searching,
  year,
}: GruposDespesasChartProps) {
  // Calcular totais por grupo baseado nas categorias agrupadas e nos totais de despesas
  const dadosGrupos = grupos
    .map((grupo) => {
      // Somar os totais de todas as categorias desse grupo
      let totalGrupo = 0;
      grupo.categorias.forEach((categoria) => {
        // Encontrar a categoria nos totaisDespesas
        const categoriaComTotal = totaisDespesas.find(
          (t) => t.categoriaId === categoria.id
        );
        if (categoriaComTotal?.totais?.pago?.valor) {
          totalGrupo += categoriaComTotal.totais.pago.valor;
        }
      });

      return {
        id: grupo.id,
        nome: grupo.nome,
        cor: grupo.cor,
        total: totalGrupo,
        categorias: grupo.categorias.length,
      };
    })
    .filter((g) => g.total > 0);

  const totalGeral = dadosGrupos.reduce((acc, g) => acc + g.total, 0);

  // Configuração para o gráfico
  const chartConfig = dadosGrupos.reduce((acc, grupo) => {
    acc[grupo.nome] = {
      label: grupo.nome,
      color: grupo.cor,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const pieData = dadosGrupos.map((g) => ({
    name: g.nome,
    value: g.total,
    fill: g.cor,
  }));

  const barData = dadosGrupos.map((g) => ({
    name: g.nome,
    total: g.total,
    fill: g.cor,
  }));

  if (grupos.every((g) => g.categorias.length === 0)) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Organize as categorias nos grupos acima para visualizar os gráficos
            de despesas.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (totaisDespesas.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Selecione as categorias e clique em &quot;Buscar&quot; para ver os
            gráficos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          Despesas por Grupo - {year}
        </CardTitle>
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
          <Tabs defaultValue="pie" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="pie" className="flex-1">
                Pizza
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex-1">
                Barras
              </TabsTrigger>
              <TabsTrigger value="resumo" className="flex-1">
                Resumo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pie">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[400px]"
              >
                <ResponsiveContainer>
                  <PieChart>
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
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="bar">
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) =>
                        (value / 1000).toLocaleString("pt-BR") + "k"
                      }
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
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
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="resumo">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dadosGrupos.map((grupo) => (
                  <Card
                    key={grupo.id}
                    className="border-l-4"
                    style={{ borderLeftColor: grupo.cor }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {grupo.nome}
                          </p>
                          <p className="text-2xl font-bold">
                            {grupo.total.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                        <div
                          className="text-right text-sm font-semibold px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${grupo.cor}20`,
                            color: grupo.cor,
                          }}
                        >
                          {((grupo.total / totalGeral) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {grupo.categorias}{" "}
                        {grupo.categorias === 1 ? "categoria" : "categorias"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
