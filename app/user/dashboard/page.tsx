"use client";
import { useEffect, useState } from "react";
// import { DataTable } from "@/app/_components/data-table";

// import data from "./data.json";
import { SearchIcon } from "lucide-react";
import {
  getBudgetByYear,
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
import { Separator } from "@/app/_components/ui/separator";
import { Switch } from "@/app/_components/ui/switch";
import ReceitasContainer from "@/app/_components/receitas-container";
import DespesasContainer from "@/app/_components/despesas-container";
import { toast } from "sonner";
import type {
  DespesaReceita,
  CategoriaComDados,
  CentroCustoComCategorias,
} from "@/app/_lib/types";

export default function Page() {
  const [year, setYear] = useState<string>("");
  const [centrosDeCusto, setCentrosDeCusto] = useState<CentroCustoComCategorias[]>([]);
  const [categorias, setCategorias] = useState<CategoriaComDados[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionId, setSessionId] = useState<string>("");
  const [switchReceitaDespesa, setSwitchReceitaDespesa] = useState(false); // false para Receita, true para Despesa
  const [receitas12months, setReceitas12Months] = useState<DespesaReceita[]>([]);
  const [despesas12months, setDespesas12Months] = useState<DespesaReceita[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [orcamentoSelectedYear, setOrcamentoSelectedYear] = useState<any>(null);

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
      // console.log("Session ID:", sessionId);
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
      inicioStr = `${year}-01-01`;
      terminoStr = `${year}-12-31`;
      inicioStrPrev = `${Number(year) - 1}-01-01`;
      terminoStrPrev = `${Number(year) - 1}-12-31`;
    } else {
      toast.error("Selecione o ano primeiro.");
      return;
    }

    const receitas12MonthsTemp = await getReceitas(inicioStr, terminoStr)
      .then((res) => res.itens)
      .catch((error) => {
        console.error("Erro ao buscar receitas 12 meses:", error);
        toast.error("Erro ao buscar receitas 12 meses.");
        return [];
      });
    setReceitas12Months(receitas12MonthsTemp);

    // Primeiro, atualizar as categorias de cada centro de custo
    const updatedCentros = [...centrosDeCusto];

    // Para cada centro de custo, filtrar as categorias que pertencem a ele
    for (const centrocusto of centrosDeCusto) {
      const catFiltro = categorias.filter((cat) =>
        cat.nome.startsWith(centrocusto.codigo + ".")
      );

      // Para cada categoria filtrada, buscar as despesas e receitas associadas
      for (const cat of catFiltro) {
        // Buscar despesas para o ano selecionado
        const despesaCategoria = await getDespesas(inicioStr, terminoStr, [
          cat.id,
        ])
          .then((res) => res.itens)
          .catch((error) => {
            console.error("Erro ao buscar despesas:", error);
            return [];
          });

        // Buscar despesas para o ano anterior
        const despesaCategoriaPrev = await getDespesas(
          inicioStrPrev,
          terminoStrPrev,
          [cat.id]
        )
          .then((resPrev) => resPrev.itens)
          .catch((error) => {
            console.error("Erro ao buscar despesas:", error);
            return [];
          });

        // Atribuir as despesas encontradas à categoria
        cat.despesas = despesaCategoria;
        cat.despesasPrev = despesaCategoriaPrev;

        // Calcula o total somando o campo 'total' de cada despesa, se existir, senão usa 'valor', desde que o campo status seja "ACQUITTED" ou "RECEBIDO" para o status_traduzido
        cat.total = despesaCategoria.reduce(
          (acc: number, despesa: DespesaReceita) =>
            despesa.status_traduzido === "RECEBIDO"
              ? acc + (typeof despesa.total === "number" ? despesa.total : 0)
              : acc,
          0
        );
        cat.totalPrev = despesaCategoriaPrev.reduce(
          (acc: number, despesa: DespesaReceita) =>
            despesa.status_traduzido === "RECEBIDO"
              ? acc + (typeof despesa.total === "number" ? despesa.total : 0)
              : acc,
          0
        );

        // Buscar receitas para o ano selecionado
        const receitaCategoria = await getReceitas(inicioStr, terminoStr, [
          cat.id,
        ])
          .then((res) => res.itens)
          .catch((error) => {
            console.error("Erro ao buscar receitas:", error);
            return [];
          });
        // Buscar receitas para o ano anterior
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

        // Atribuir as receitas encontradas à categoria
        cat.receitas = receitaCategoria;
        cat.receitasPrev = receitaCategoriaPrev;

        // Calcula o total de receitas
        cat.totalReceitas = receitaCategoria.reduce(
          (acc: number, receita: DespesaReceita) =>
            acc + (typeof receita.total === "number" ? receita.total : 0),
          0
        );
        cat.totalReceitasPrev = receitaCategoriaPrev.reduce(
          (acc: number, receita: DespesaReceita) =>
            acc + (typeof receita.total === "number" ? receita.total : 0),
          0
        );

        // Busca o Orçamento Previsto para o ano selecionado
        const orcamentoPrevisto = await getBudgetByYear(year)
          .then((res) => {
            return res;
          })
          .catch((error) => {
            console.error("Erro ao buscar orçamento do ano:", error);
            return [];
          });

        // Atribui o orcamento no estado
        setOrcamentoSelectedYear(orcamentoPrevisto);

        // Atribuir o total do orçamento previsto à categoria
        if (
          orcamentoPrevisto &&
          !Array.isArray(orcamentoPrevisto) &&
          orcamentoPrevisto.valores
        ) {
          const valorCategoria = orcamentoPrevisto.valores.find(
            (valor) => valor.item?.descricao === cat.nome
          );
          cat.orcamentoAtual = valorCategoria
            ? Number(valorCategoria.valor)
            : 0;
        } else {
          cat.orcamentoAtual = 0;
        }

        // final do loop categorias
      }
      centrocusto.categorias = catFiltro;
    }

    setDespesas12Months([]);
    setCentrosDeCusto(updatedCentros);
    setSearching(false);
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
              <DespesasContainer
                centrosDeCusto={centrosDeCusto}
                searching={searching}
                despesas12months={despesas12months}
                year={year}
              />
            </>
          ) : (
            <ReceitasContainer
              centrosDeCusto={centrosDeCusto}
              searching={searching}
              year={year}
              receitas12months={receitas12months}
            />
          )}
        </div>
      </div>
    </div>
  );
}
