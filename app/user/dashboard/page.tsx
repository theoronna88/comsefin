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

// TODO: Acrescentar os outros gráficos de despesas.
// TODO: Refatorar os gráficos de receitas para usar um gráfico parecido com o de despesas.

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
  }

  async function handleOnDespesasClick() {
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
                      {/* Seleção de categorias de receita que irão aparecer no gráfico */}
                      <div className="flex flex-1 flex-col p-8 bg-slate-200 rounded-lg">
                        <div className="flex flex-wrap gap-4 mb-4">
                          <Label className="w-full font-medium">
                            Categorias de Receita:
                          </Label>
                          {categoriasReceita.map((categoria) => (
                            <div
                              key={categoria.id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={`${categoria.id}`}
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
                              <Label htmlFor={`${categoria.id}`}>
                                {categoria.nome}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Dropdown de ano */}
                      <div className="px-6 w-60">
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
                        <Button
                          className="w-40 mt-4"
                          variant="outline"
                          onClick={handleOnClick}
                        >
                          <SearchIcon />
                          Buscar
                        </Button>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
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
                        disabled={selectedDespesasCategories.length === 0}
                      >
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Buscar Despesas
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
