"use client";
import { useEffect, useState, useCallback } from "react";

import { SearchIcon } from "lucide-react";
import { getCategorias, getCentroCusto } from "@/app/api/api";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";

import { toast } from "sonner";
import { fetchingReceitasComFiltros } from "@/app/_actions/receita-actions";
import {
  Categoria,
  CentroCusto,
  GrupoDespesa,
  GRUPOS_DESPESAS_GRUPOPNG,
} from "@/app/_lib/types";
import { Checkbox } from "@/app/_components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import YearVsYearCategory from "@/app/_components/graphs/year-vs-year-category";
import { PercentualCategoriasPie } from "@/app/_components/percentual-categorias-pie";
import { fetchingDespesasComFiltros } from "@/app/_actions/despesa-actions";
import { CategoryGroupManager } from "@/app/_components/drag-drop";
import { GruposDespesasChart } from "@/app/_components/graphs/grupos-despesas-chart";
import { OrcamentoVsRealizadoChart } from "@/app/_components/graphs/orcamento-vs-realizado-chart";
import { fetchBudget } from "@/app/_actions/orcamento-actions";
import { Orcamento } from "@/app/_lib/types";
import { useAsyncAction } from "@/app/_hooks/use-async-action";

// TODO: Acrescentar os outros gráficos de despesas.

interface SelectedCategory {
  id: string | number;
  nome: string;
}

export default function Page() {
  const [year, setYear] = useState<string>("");
  const [centrosDeCusto, setCentrosDeCusto] = useState<CentroCusto[]>([]);

  const [categoriasReceita, setCategoriasReceita] = useState<Categoria[]>([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState<Categoria[]>([]);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionId, setSessionId] = useState<string>("");

  const [selectedReceitasCategories, setSelectedReceitasCategories] = useState<
    SelectedCategory[]
  >([]);
  const [selectedDespesasCategories, setSelectedDespesasCategories] = useState<
    SelectedCategory[]
  >([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [totaisReceita, setTotaisReceita] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [totaisDespesas, setTotaisDespesas] = useState<any[]>([]);

  // Estado para os grupos de despesas (drag and drop)
  const [gruposDespesas, setGruposDespesas] = useState<GrupoDespesa[]>(() =>
    GRUPOS_DESPESAS_GRUPOPNG.map((g) => ({ ...g, categorias: [] }))
  );

  const [budget, setBudget] = useState<Orcamento | null>(null);

  // Hooks para gerenciar loading dos botões
  const { execute: executeReceitas, isLoading: isLoadingReceitas } =
    useAsyncAction();
  const { execute: executeDespesas, isLoading: isLoadingDespesas } =
    useAsyncAction();

  // Callback quando os grupos mudam
  const handleGroupsChange = useCallback((grupos: GrupoDespesa[]) => {
    setGruposDespesas(grupos);
    // Atualizar as categorias selecionadas baseado nos grupos
    const categoriasAgrupadas = grupos.flatMap((g) =>
      g.categorias.map((c) => ({ id: c.id, nome: c.nome }))
    );
    setSelectedDespesasCategories(categoriasAgrupadas);
  }, []);

  useEffect(() => {
    const fetchCentrosDeCusto = async () => {
      try {
        const res = await getCentroCusto();
        setCentrosDeCusto(res.itens);
      } catch (error) {
        console.error("Erro ao buscar centros de custo:", error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await getCategorias("RECEITA");
        const res2 = await getCategorias("DESPESA");
        setCategoriasReceita(res.itens);
        setCategoriasDespesa(res2.itens);
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
    if (year === "" || year === null) {
      toast.error("Selecione o ano primeiro.");
      return;
    }
    if (selectedReceitasCategories.length === 0) {
      toast.error("Selecione ao menos uma categoria de receita.");
      return;
    }

    executeReceitas(async () => {
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

      const temp = await fetchingReceitasComFiltros({
        selectedReceitasCategories: selectedReceitasCategories.map((c) => ({
          id: String(c.id),
          nome: c.nome,
        })),
        inicioStr,
        terminoStr,
        inicioStrPrev,
        terminoStrPrev,
      });
      setTotaisReceita(temp);
      setSearching(false);
    });
  }

  async function fetchBudgetData(year: string) {
    fetchBudget(Number(year))
      .then((data) => {
        setBudget(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar orçamento:", error);
      });
  }

  async function handleOnDespesasClick() {
    executeDespesas(async () => {
      setSearching(true);

      fetchBudgetData(year);

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

      const temp = await fetchingDespesasComFiltros({
        selectedDespesasCategories: selectedDespesasCategories.map((c) => ({
          id: String(c.id),
          nome: c.nome,
        })),
        inicioStr,
        terminoStr,
        inicioStrPrev,
        terminoStrPrev,
      });
      setTotaisDespesas(temp);
      setSearching(false);

      console.log("Budget state after fetch:", budget);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useEffect(() => {}, [
    selectedReceitasCategories,
    selectedDespesasCategories,
    centrosDeCusto,
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex w-11/12 mx-auto flex-col gap-6">
            <Tabs defaultValue="receitas">
              <TabsList>
                <TabsTrigger value="receitas">Receitas</TabsTrigger>
                <TabsTrigger value="despesas">Despesas</TabsTrigger>
              </TabsList>
              <TabsContent value="receitas">
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas</CardTitle>
                    <CardDescription>
                      Selecione as categorias de receita para visualizar os
                      gráficos comparativos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    {/* Seleção de categorias de receita que irão aparecer no gráfico */}
                    <div className="flex flex-1 flex-col p-6 bg-slate-100 rounded-lg">
                      <Label className="font-medium mb-4">
                        Categorias de Receita:
                      </Label>
                      <div className="flex flex-wrap gap-4">
                        {categoriasReceita.map((categoria) => (
                          <div
                            key={categoria.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={`receita-${categoria.id}`}
                              checked={selectedReceitasCategories.some(
                                (cat) => cat.id === categoria.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedReceitasCategories((prev) => [
                                    ...prev,
                                    {
                                      id: categoria.id,
                                      nome: categoria.nome,
                                    },
                                  ]);
                                } else {
                                  setSelectedReceitasCategories((prev) =>
                                    prev.filter(
                                      (cat) => cat.id !== categoria.id
                                    )
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`receita-${categoria.id}`}>
                              {categoria.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Seleção de ano e botão de buscar */}
                    <div className="flex items-end gap-4 p-4 bg-slate-100 rounded-lg">
                      <div className="w-48">
                        <Label className="block text-sm font-medium mb-1">
                          Ano:
                        </Label>
                        <Select onValueChange={(value) => setYear(value)}>
                          <SelectTrigger className="border rounded px-2 py-1">
                            <SelectValue placeholder="Selecione o ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const yearOption = (
                                new Date().getFullYear() - idx
                              ).toString();
                              return (
                                <SelectItem key={yearOption} value={yearOption}>
                                  {yearOption}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleOnClick}
                        disabled={
                          selectedReceitasCategories.length === 0 ||
                          isLoadingReceitas
                        }
                      >
                        <SearchIcon className="mr-2 h-4 w-4" />
                        {isLoadingReceitas ? "Buscando..." : "Buscar Receitas"}
                      </Button>
                      {selectedReceitasCategories.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {selectedReceitasCategories.length} categorias
                          selecionadas
                        </span>
                      )}
                    </div>
                    {/* Espaço para colocar o gráfico de receitas */}

                    {/* Gráfico Pie Todas as Categorias para ver % de Receitas */}
                    <PercentualCategoriasPie
                      categorias={totaisReceita}
                      searching={searching}
                      year={year}
                      title="Distribuição de Receitas por Categoria"
                    />

                    {/* Gráfico Multibar Ano x Ano */}
                    <YearVsYearCategory
                      totaisReceita={totaisReceita}
                      searching={searching}
                      year={year}
                      title="Receitas"
                    />

                    {/* Gráfico Receitas ao longo do Ano - Verificar necessidade depois ! */}

                    {/* Final do gráfico de receitas */}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="despesas">
                <Card>
                  <CardHeader>
                    <CardTitle>Despesas</CardTitle>
                    <CardDescription>
                      Arraste as categorias para os grupos de despesas para
                      organizar e visualizar os gráficos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    {/* Sistema de Drag and Drop para agrupar categorias */}
                    <CategoryGroupManager
                      categorias={categoriasDespesa}
                      onGroupsChange={handleGroupsChange}
                      initialGroups={gruposDespesas}
                    />

                    {/* Seleção de ano e botão de buscar */}
                    <div className="flex items-end gap-4 p-4 bg-slate-100 rounded-lg">
                      <div className="w-48">
                        <Label className="block text-sm font-medium mb-1">
                          Ano:
                        </Label>
                        <Select onValueChange={(value) => setYear(value)}>
                          <SelectTrigger className="border rounded px-2 py-1">
                            <SelectValue placeholder="Selecione o ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const yearOption = (
                                new Date().getFullYear() - idx
                              ).toString();
                              return (
                                <SelectItem key={yearOption} value={yearOption}>
                                  {yearOption}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleOnDespesasClick}
                        disabled={
                          selectedDespesasCategories.length === 0 ||
                          isLoadingDespesas
                        }
                      >
                        <SearchIcon className="mr-2 h-4 w-4" />
                        {isLoadingDespesas ? "Buscando..." : "Buscar Despesas"}
                      </Button>
                      {selectedDespesasCategories.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {selectedDespesasCategories.length} categorias
                          selecionadas
                        </span>
                      )}
                    </div>

                    {/* Gráfico de Despesas por Grupos */}
                    <GruposDespesasChart
                      grupos={gruposDespesas}
                      totaisDespesas={totaisDespesas}
                      searching={searching}
                      year={year}
                    />

                    {/* Gráfico Pie Todas as Categorias para ver % de Despesas
                    {totaisDespesas.length > 0 && (
                      <PercentualCategoriasPie
                        categorias={totaisDespesas}
                        searching={searching}
                        year={year}
                        title="Distribuição de Despesas por Categoria"
                      />
                    )}
*/}

                    {/* Neste trecho precio renderizar o gráfico de despesas agrupadas
                      pegar as categorias do grupo e mostrar em barras comparando com 
                      o orçamento daquela categoria que está armazenado no estado budget.
                    */}
                    <OrcamentoVsRealizadoChart
                      grupos={gruposDespesas}
                      totaisDespesas={totaisDespesas}
                      budget={budget}
                      searching={searching}
                      year={year}
                    />

                    {/* Fim do gráfico de despesas */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Espaço para colocar o relatório de receitas e despesas
            Chamar o gráfico com os checkboxes selecionados para fazer a busca somente das receitas das categorias selecionadas.
          */}
        </div>
      </div>
    </div>
  );
}
