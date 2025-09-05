"use client";
import { useEffect, useState } from "react";
// import { DataTable } from "@/app/_components/data-table";

// import data from "./data.json";
import { SearchIcon } from "lucide-react";
import {
  getCategorias,
  getCentroCusto,
  getDespesas,
  getReceitas,
} from "@/app/api/api";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import YearVsYear from "@/app/_components/graphs/year-vs-year";
import { ChartAreaInteractive } from "@/app/_components/graphs/chart-area-interactive";
import { TotalPieExercicio } from "@/app/_components/total-pie";
import { Separator } from "@/app/_components/ui/separator";
import { Switch } from "@/app/_components/ui/switch";

export default function Page() {
  interface Categoria {
    id: number;
    nome: string;
    despesas?: [];
    despesasPrev?: [];
    total?: number;
    totalPrev?: number;
    receitas?: [];
    receitasPrev?: [];
    totalReceitas?: number;
    totalReceitasPrev?: number;
  }

  interface CentroCusto {
    id: number;
    codigo: string;
    nome: string;
    categorias?: Categoria[];
  }

  interface Despesa {
    id: number;
    total: number;
  }

  const [year, setYear] = useState<string>("");
  const [centrosDeCusto, setCentrosDeCusto] = useState<CentroCusto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [switchReceitaDespesa, setSwitchReceitaDespesa] = useState(false); // false para Receita, true para Despesa
  const [receitas12months, setReceitas12Months] = useState([]);
  const [despesas12months, setDespesas12Months] = useState([]);

  useEffect(() => {
    // Get session ID from NextAuth cookie
    const sessionToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("next-auth.session-token="))
      ?.split("=")[1];

    if (sessionToken) {
      setSessionId(sessionToken);
    }
  }, []);

  useEffect(() => {
    const fetchCentrosDeCusto = async () => {
      console.log("Session ID:", sessionId);
      try {
        const res = await getCentroCusto();
        setCentrosDeCusto(res.itens);
      } catch (error) {
        console.error("Erro ao buscar centros de custo:", error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(res.itens);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    if (!loading) {
      fetchCentrosDeCusto();
      fetchCategorias();
      setLoading(true);
    }
  }, [loading]);

  async function handleOnClick() {
    setSearching(true);
    let inicioStr = "";
    let terminoStr = "";
    let inicioStrPrev = "";
    let terminoStrPrev = "";
    if (year) {
      // if (inicio && termino) {
      inicioStr = `${year}-01-01`;
      terminoStr = `${year}-12-31`;
      inicioStrPrev = `${Number(year) - 1}-01-01`;
      terminoStrPrev = `${Number(year) - 1}-12-31`;
    } else {
      console.log("Selecione o ano primeiro.");
      return;
    }

    const receitas12MonthsTemp = await getReceitas(inicioStr, terminoStr)
      .then((res) => res.itens)
      .catch((error) => {
        console.error("Erro ao buscar receitas 12 meses:", error);
        return [];
      });
    console.log("receitas12months: ", receitas12MonthsTemp);
    setReceitas12Months(receitas12MonthsTemp);

    const despesas12MonthsTemp = await getDespesas(inicioStr, terminoStr)
      .then((res) => res.itens)
      .catch((error) => {
        console.error("Erro ao buscar despesas 12 meses:", error);
        return [];
      });
    console.log("despesas12months: ", despesas12MonthsTemp);
    setDespesas12Months(despesas12MonthsTemp);

    // Primeiro, atualizar as categorias de cada centro de custo
    const updatedCentros = [...centrosDeCusto];
    console.log("Categorias carregadas:", categorias);
    console.log("Centros de custo antes da atualização:", updatedCentros);
    for (const centrocusto of centrosDeCusto) {
      const catFiltro = categorias.filter((cat) =>
        cat.nome.startsWith(centrocusto.codigo + ".")
      );
      for (const cat of catFiltro) {
        const despesaCategoria = await getDespesas(inicioStr, terminoStr, [
          cat.id,
        ])
          .then((res) => res.itens)
          .catch((error) => {
            console.error("Erro ao buscar despesas:", error);
            return [];
          });
        const despesaCategoriaPrev = await getDespesas(
          inicioStrPrev,
          terminoStrPrev,
          [cat.id]
        )
          .then((res) => res.itens)
          .catch((error) => {
            console.error("Erro ao buscar despesas:", error);
            return [];
          });

        cat.despesas = despesaCategoria;
        cat.despesasPrev = despesaCategoriaPrev;
        // Calcula o total somando o campo 'total' de cada despesa, se existir, senão usa 'valor'
        cat.total = despesaCategoria.reduce(
          (acc: number, despesa: Despesa) =>
            acc + (typeof despesa.total === "number" ? despesa.total : 0),
          0
        );
        cat.totalPrev = despesaCategoriaPrev.reduce(
          (acc: number, despesa: Despesa) =>
            acc + (typeof despesa.total === "number" ? despesa.total : 0),
          0
        );

        const receitaCategoria = await getReceitas(inicioStr, terminoStr, [
          cat.id,
        ])
          .then((res) => res.itens)
          .catch((error) => {
            console.error("Erro ao buscar receitas:", error);
            return [];
          });
        const receitaCategoriaPrev = await getReceitas(
          inicioStrPrev,
          terminoStrPrev,
          [cat.id]
        )
          .then((res) => res.itens)
          .catch((error) => {
            console.error("Erro ao buscar receitas:", error);
            return [];
          });
        cat.receitas = receitaCategoria;
        cat.receitasPrev = receitaCategoriaPrev;

        // Calcula o total de receitas
        cat.totalReceitas = receitaCategoria.reduce(
          (acc: number, receita: Despesa) =>
            acc + (typeof receita.total === "number" ? receita.total : 0),
          0
        );
        cat.totalReceitasPrev = receitaCategoriaPrev.reduce(
          (acc: number, receita: Despesa) =>
            acc + (typeof receita.total === "number" ? receita.total : 0),
          0
        );
      }

      centrocusto.categorias = catFiltro;
    }
    setCentrosDeCusto(updatedCentros);
    setSearching(false);
    console.log("Centros de custo atualizados:", updatedCentros);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex gap-3 items-end">
            {/* Dropdown de ano */}
            <div className="px-6">
              <Label className="block text-sm font-medium mb-1">Ano:</Label>
              <Select onValueChange={(value) => setYear(value)}>
                <SelectTrigger className="border rounded px-2 py-1">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const year = (new Date().getFullYear() - idx).toString();
                    return (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-40" variant="outline" onClick={handleOnClick}>
              <SearchIcon />
              Buscar
            </Button>
            <div className="flex items-center gap-2 justify-center">
              <div className="flex items-center space-x-2">
                <Label>Receita</Label>
                <Switch
                  checked={switchReceitaDespesa}
                  onCheckedChange={(checked) =>
                    setSwitchReceitaDespesa(checked)
                  }
                />
                <Label>Despesa</Label>
              </div>
            </div>
          </div>

          <Separator />

          {switchReceitaDespesa ? (
            <>
              <Label className="px-6 text-lg font-bold">Despesa</Label>
            </>
          ) : (
            <>
              <Label className="px-6 text-lg font-bold">Receitas</Label>
              <TotalPieExercicio
                centrosDeCusto={centrosDeCusto}
                searching={searching}
                year={year}
                title="Total de Receita Exercício"
              />

              <YearVsYear
                centrosDeCusto={centrosDeCusto}
                searching={searching}
                year={year}
                title="Receitas"
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  values={receitas12months}
                  title="Receitas"
                />
              </div>
              {/*<DataTable data={data} />*/}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
