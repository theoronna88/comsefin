"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

const data = [
  {
    date: "jan",
    totalReceita: 0,
  },
  {
    date: "fev",
    totalReceita: 0,
  },
  {
    date: "mar",
    totalReceita: 0,
  },
  {
    date: "abr",
    totalReceita: 0,
  },
  {
    date: "mai",
    totalReceita: 0,
  },
  {
    date: "jun",
    totalReceita: 0,
  },
  {
    date: "jul",
    totalReceita: 0,
  },
  {
    date: "ago",
    totalReceita: 0,
  },
  {
    date: "set",
    totalReceita: 0,
  },
  {
    date: "out",
    totalReceita: 0,
  },
  {
    date: "nov",
    totalReceita: 0,
  },
  {
    date: "dez",
    totalReceita: 0,
  },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  values: Array<{
    id: number;
    total: number;
    descricao?: string;
    status_traduzido: string;
    nao_pago?: number;
    pago?: number;
    data_vencimento?: string;
  }>;
  title?: string;
}

/* 

{
    "id": "9a3e41f1-f4fd-46ce-a129-5323ebb8a3f1",
    "status": "ACQUITTED",
    "total": 100000,
    "descricao": "RECEITA 001",
    "data_vencimento": "2025-03-03",
    "status_traduzido": "RECEBIDO",
    "nao_pago": 0,
    "pago": 100000,
    "data_criacao": "2025-06-28T07:48:30.223062",
    "data_alteracao": "2025-06-28T07:48:30.223062",
    "cliente": {
        "id": null,
        "nome": null
    }
}

*/

export function ChartAreaInteractive({
  values,
  title,
}: ChartAreaInteractiveProps) {
  const sumMonthReceita = (
    values: Array<{
      id: number;
      total: number;
      descricao?: string;
      status_traduzido: string;
      nao_pago?: number;
      pago?: number;
      data_vencimento?: string;
    }>
  ) => {
    for (let i = 1; i <= 12; i++) {
      const month = i;
      const filtered = values.filter((item) => {
        if (!item.data_vencimento) return false;
        const date = new Date(item.data_vencimento);
        return month === date.getMonth() + 1;
      });
      data[i - 1].totalReceita = filtered.reduce(
        (acc, item) => acc + item.total,
        0
      );
    }
    return data;
  };

  if (values) {
    sumMonthReceita(values);
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Total {title}</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Total de {title}s nos últimos 12 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 12 meses</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return value.toUpperCase();
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="totalReceita"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            {/*
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
