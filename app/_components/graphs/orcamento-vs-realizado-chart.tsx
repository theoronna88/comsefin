"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LabelList,
} from "recharts";
import LoadingComsefaz from "@/app/_components/comsefaz-loading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { GrupoDespesa, Orcamento } from "@/app/_lib/types";

interface TotalDespesaItem {
  categoriaId: number | string;
  nome?: string;
  totais?: {
    pago?: {
      valor?: number;
    };
  };
}

interface OrcamentoVsRealizadoChartProps {
  grupos: GrupoDespesa[];
  totaisDespesas: TotalDespesaItem[];
  budget: Orcamento | null | undefined;
  searching: boolean;
  year: string;
}

interface CategoriaChartData {
  name: string;
  Orcado: number;
  Realizado: number;
  percentual: number | string;
}

interface GrupoComDados {
  id: string;
  nome: string;
  cor: string;
  categorias: CategoriaChartData[];
  totalOrcado: number;
  totalRealizado: number;
  diferenca: number;
  percentual: number | string;
}

export function OrcamentoVsRealizadoChart({
  grupos,
  totaisDespesas,
  budget,
  searching,
  year,
}: OrcamentoVsRealizadoChartProps) {
  const orcamentoMap = new Map<string, number>();
  if (budget?.valores) {
    budget.valores.forEach((valor) => {
      const categoriaId = valor.item?.codigo;
      if (categoriaId) {
        orcamentoMap.set(categoriaId, Number(valor.valor));
      }
    });
  }

  const gruposComDados: GrupoComDados[] = grupos
    .map((grupo) => {
      let totalOrcado = 0;
      let totalRealizado = 0;

      const categoriasData: CategoriaChartData[] = grupo.categorias
        .map((categoria) => {
          const categoriaComTotal = totaisDespesas.find(
            (t) => t.categoriaId === categoria.id,
          );
          const realizado = categoriaComTotal?.totais?.pago?.valor || 0;
          const orcado = orcamentoMap.get(categoria.id) || 0;

          totalOrcado += orcado;
          totalRealizado += realizado;

          const percentual = orcado > 0 ? (realizado / orcado) * 100 : "-";

          return {
            name: categoria.nome,
            Orcado: orcado,
            Realizado: realizado,
            percentual,
          };
        })
        .filter((cat) => cat.Orcado > 0 || cat.Realizado > 0);

      return {
        id: grupo.id,
        nome: grupo.nome,
        cor: grupo.cor,
        categorias: categoriasData,
        totalOrcado,
        totalRealizado,
        diferenca: totalOrcado - totalRealizado,
        percentual:
          totalOrcado > 0 ? (totalRealizado / totalOrcado) * 100 : "-",
      };
    })
    .filter((g) => g.categorias.length > 0);

  const totalOrcadoGeral = gruposComDados.reduce(
    (acc, g) => acc + g.totalOrcado,
    0,
  );
  const totalRealizadoGeral = gruposComDados.reduce(
    (acc, g) => acc + g.totalRealizado,
    0,
  );

  if (grupos.every((g) => g.categorias.length === 0)) {
    return null;
  }

  if (totaisDespesas.length === 0) {
    return null;
  }

  if (!budget) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">
            Orçado vs Realizado - {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Nenhum orçamento encontrado para o ano {year}. Crie um orçamento
            para visualizar a comparação.
          </p>
        </CardContent>
      </Card>
    );
  }

  const diferencaGeral = totalOrcadoGeral - totalRealizadoGeral;

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">
            Resumo Orçado vs Realizado - {year}
          </CardTitle>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <p>
              Total Orçado:{" "}
              <span className="font-semibold text-[#2f5597]">
                {totalOrcadoGeral.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
            <p>
              Total Realizado:{" "}
              <span className="font-semibold text-[#afabab]">
                {totalRealizadoGeral.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
            <p>
              Diferença:{" "}
              <span
                className={
                  diferencaGeral >= 0
                    ? "font-semibold text-[#2f5597]"
                    : "font-semibold text-[#afabab]"
                }
              >
                {diferencaGeral.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
          </div>
        </CardHeader>
      </Card>

      {searching ? (
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <LoadingComsefaz width={150} height={150} />
          </CardContent>
        </Card>
      ) : (
        gruposComDados.map((grupo) => {
          const borderStyle = { borderLeft: "4px solid " + grupo.cor };
          const bgStyle = { backgroundColor: grupo.cor };

          return (
            <Card key={grupo.id} className="w-full">
              <CardHeader className="pb-2" style={borderStyle}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={bgStyle} />
                    {grupo.nome}
                  </div>
                  <div className="flex gap-6 text-sm font-normal text-muted-foreground">
                    <span>
                      Orçado:{" "}
                      <span className="font-semibold text-[#2f5597]">
                        {grupo.totalOrcado.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </span>
                    <span>
                      Realizado:{" "}
                      <span className="font-semibold text-[#afabab]">
                        {grupo.totalRealizado.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </span>
                    <span>
                      Utilizado:{" "}
                      <span
                        className={
                          typeof grupo.percentual === "number" &&
                          grupo.percentual <= 100
                            ? "font-semibold text-[#2f5597]"
                            : "font-semibold text-[#afabab]"
                        }
                      >
                        {typeof grupo.percentual === "number"
                          ? grupo.percentual.toFixed(1) + "%"
                          : grupo.percentual}
                      </span>
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(200, grupo.categorias.length * 60 + 80)}
                >
                  <BarChart
                    data={grupo.categorias}
                    layout="vertical"
                    margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) =>
                        "R$ " + value.toLocaleString("pt-BR")
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={170}
                      tick={(props) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { x, y, payload } = props;
                        // Função para quebrar o texto (ex: 25 caracteres)
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
                              {lines.map((line, index) => (
                                <tspan
                                  key={index}
                                  x={0}
                                  dy={index === 0 ? "0em" : "1.2em"}
                                  textAnchor="start"
                                  style={{
                                    textRendering: "optimizeLegibility",
                                  }}
                                >
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ marginRight: 50 }}>{value}</span>
                      )}
                    />
                    <Bar
                      dataKey="Orcado"
                      fill="#2f5597"
                      name="Orçado"
                      barSize={16}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="Realizado"
                      fill="#afabab"
                      name="Realizado"
                      barSize={16}
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="percentual"
                        position="right"
                        formatter={(value: number | string) =>
                          typeof value === "number"
                            ? value.toFixed(1) + "%"
                            : value + ""
                        }
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          fill: "#374151",
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Categoria</th>
                        <th className="text-right py-2 px-3">Orçado</th>
                        <th className="text-right py-2 px-3">Realizado</th>
                        <th className="text-right py-2 px-3">Diferença</th>
                        <th className="text-right py-2 px-3">% Utilizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.categorias.map((cat, idx) => {
                        const dif = cat.Orcado - cat.Realizado;
                        const difClass =
                          dif >= 0
                            ? "text-right py-2 px-3 text-green-600"
                            : "text-right py-2 px-3 text-red-600";
                        const percClass =
                          typeof cat.percentual === "number" &&
                          cat.percentual <= 100
                            ? "text-right py-2 px-3 text-green-600"
                            : "text-right py-2 px-3 text-red-600";

                        return (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-3">{cat.name}</td>
                            <td className="text-right py-2 px-3">
                              {cat.Orcado.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>
                            <td className="text-right py-2 px-3">
                              {cat.Realizado.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>
                            <td className={difClass}>
                              {dif.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </td>
                            <td className={percClass}>
                              {typeof cat.percentual === "number"
                                ? cat.percentual.toFixed(1) + "%"
                                : cat.percentual}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold bg-muted/30">
                        <td className="py-2 px-3">Total do Grupo</td>
                        <td className="text-right py-2 px-3">
                          {grupo.totalOrcado.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="text-right py-2 px-3">
                          {grupo.totalRealizado.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td
                          className={
                            grupo.diferenca >= 0
                              ? "text-right py-2 px-3 text-green-600"
                              : "text-right py-2 px-3 text-red-600"
                          }
                        >
                          {grupo.diferenca.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td
                          className={
                            typeof grupo.percentual === "number" &&
                            grupo.percentual <= 100
                              ? "text-right py-2 px-3 text-green-600"
                              : "text-right py-2 px-3 text-red-600"
                          }
                        >
                          {typeof grupo.percentual === "number"
                            ? grupo.percentual.toFixed(1) + "%"
                            : grupo.percentual}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
