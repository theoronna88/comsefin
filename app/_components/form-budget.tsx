"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "./ui/select";
import { saveBudget } from "@/app/api/orcamento";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import type { Categoria, Orcamento, GrupoDespesa } from "@/app/_lib/types";
import { GRUPOS_DESPESAS_GRUPOPNG } from "@/app/_lib/types";
import { useAsyncAction } from "../_hooks/use-async-action";
import {
  extractDigits,
  formatBRLFromCents,
  centsToNumber,
  numberToCents,
} from "@/app/_lib/utils";
import { getOrganizacaoCategorias } from "@/app/_actions/categoria-actions";

const FormBudget = ({
  categorias,
  budget,
  onClose,
}: {
  categorias: Categoria[];
  budget: Orcamento | null;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [firstPass, setFirstPass] = useState(true);
  const { execute, isLoading } = useAsyncAction();
  const [gruposDespesas, setGruposDespesas] = useState<GrupoDespesa[]>([]);
  const [despesasNaoAgrupadas, setDespesasNaoAgrupadas] = useState<Categoria[]>(
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "ano") {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: extractDigits(value),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    execute(async () => {
      // Mapear os IDs das categorias para seus nomes
      const categoriaMap = new Map(categorias.map((cat) => [cat.id, cat.nome]));

      const data = {
        id: budget?.id,
        ano: formData?.ano,
        categorias: Object.entries(formData)
          .filter(([key]) => key !== "ano")
          .map(([categoriaId, valor]) => ({
            categoriaId,
            nome: categoriaMap.get(categoriaId) || categoriaId,
            valor: centsToNumber(valor),
          })),
      };

      try {
        // saveBudget retorna { success, message } em vez de lançar erro:
        // mensagens de Server Action são redigidas em produção pelo Next.js,
        // então o retorno estruturado é o que faz a mensagem chegar ao usuário.
        const result = await saveBudget(data);

        if (result?.success) {
          toast.success("Orçamento salvo com sucesso!");
          setFormData({});
          window.location.href = "/user/budget";
          onClose();
        } else {
          toast.error("Erro ao salvar o orçamento.", {
            description: result?.message || "Tente novamente.",
          });
        }
      } catch (error) {
        // Fallback para erros inesperados (ex.: falha de rede/redirect)
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";
        toast.error("Erro ao salvar o orçamento.", {
          description: errorMessage,
        });
      }
    });
  };

  useEffect(() => {
    if (budget && firstPass) {
      // Preencher o formData com os valores do orçamento existente
      const existingData: { [key: string]: string } = {
        ano: String(budget.ano),
      };
      budget.valores?.forEach((valor) => {
        // O codigo do item contém o categoriaId (UUID da categoria do Conta Azul)
        const categoriaId = valor.item?.codigo;
        if (categoriaId) {
          existingData[categoriaId] = numberToCents(Number(valor.valor));
        }
      });
      setFormData(existingData);
      setFirstPass(false);
    }
  }, [budget, firstPass]);

  useEffect(() => {
    const fetchOrganizacao = async () => {
      const organizacaoSalva = await getOrganizacaoCategorias();
      if (organizacaoSalva.length === 0) return;

      const despesas = categorias.filter((cat) => cat.tipo === "DESPESA");

      const gruposComCategorias = GRUPOS_DESPESAS_GRUPOPNG.map((grupo) => {
        const categoriasDoGrupo = organizacaoSalva
          .filter((org) => org.grupoId === grupo.id)
          .sort((a, b) => a.ordem - b.ordem)
          .map((org) =>
            despesas.find((cat) => cat.id === org.contaAzulCategoryId),
          )
          .filter(Boolean) as Categoria[];
        return { ...grupo, categorias: categoriasDoGrupo };
      });

      setGruposDespesas(gruposComCategorias);

      const idsAgrupados = new Set(
        organizacaoSalva.map((o) => o.contaAzulCategoryId),
      );
      setDespesasNaoAgrupadas(
        despesas.filter((cat) => !idsAgrupados.has(cat.id)),
      );
    };

    if (categorias.length > 0) {
      fetchOrganizacao();
    }
  }, [categorias]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 m-4 w-3/4 mx-auto overflow-y-auto">
          <Label>Selecione o Ano</Label>
          <Select
            key={formData.ano || "empty"}
            name="ano"
            onValueChange={(value) => setFormData({ ...formData, ano: value })}
            defaultValue={formData.ano}
            value={formData.ano}
          >
            <SelectTrigger className="border-2 border-gray-200 rounded-md p-1 w-[180px]">
              <SelectValue placeholder="Selecione o Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Array.from({ length: 5 }, (_, i) => {
                  const currentYear = new Date().getFullYear();
                  const year = currentYear - 2 + i;
                  return (
                    <SelectItem key={i} value={`${year}`}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Card>
            <CardContent className="bg-blue-50">
              {/* Receitas */}
              {categorias
                .filter((cat) => cat.tipo === "RECEITA")
                .map((categoria) => (
                  <div key={categoria.id}>
                    <Label htmlFor={categoria.nome}>{categoria.nome}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      name={categoria.id}
                      placeholder={categoria.nome}
                      onChange={handleChange}
                      value={
                        formData[categoria.id]
                          ? formatBRLFromCents(formData[categoria.id])
                          : ""
                      }
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
          {/* Despesas */}
          {gruposDespesas.some((g) => g.categorias.length > 0) ? (
            <>
              {gruposDespesas
                .filter((grupo) => grupo.categorias.length > 0)
                .map((grupo) => (
                  <Card key={grupo.id}>
                    <CardContent className="p-0 flex">
                      <div className="flex items-stretch gap-4">
                        {/* Faixa com a cor do grupo */}
                        <div
                          className="w-2 rounded-full h-full"
                          style={{ backgroundColor: grupo.cor }}
                        ></div>
                      </div>

                      <div className="py-2 px-4">
                        {/* Conteúdo */}
                        <Label className="text-base font-semibold mb-2 block">
                          {grupo.nome} - {grupo.cor}
                        </Label>
                        {grupo.categorias.map((categoria) => (
                          <div key={categoria.id}>
                            <Label htmlFor={categoria.nome}>
                              {categoria.nome}
                            </Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              name={categoria.id}
                              placeholder={categoria.nome}
                              onChange={handleChange}
                              value={
                                formData[categoria.id]
                                  ? formatBRLFromCents(formData[categoria.id])
                                  : ""
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {despesasNaoAgrupadas.length > 0 && (
                <Card>
                  <CardContent className="bg-red-50">
                    <Label className="text-base font-semibold mb-2 block">
                      Outras Despesas
                    </Label>
                    {despesasNaoAgrupadas.map((categoria) => (
                      <div key={categoria.id}>
                        <Label htmlFor={categoria.nome}>{categoria.nome}</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          name={categoria.id}
                          placeholder={categoria.nome}
                          onChange={handleChange}
                          value={
                            formData[categoria.id]
                              ? formatBRLFromCents(formData[categoria.id])
                              : ""
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="bg-red-50">
                {categorias
                  .filter((cat) => cat.tipo === "DESPESA")
                  .map((categoria) => (
                    <div key={categoria.id}>
                      <Label htmlFor={categoria.nome}>{categoria.nome}</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        name={categoria.id}
                        placeholder={categoria.nome}
                        onChange={handleChange}
                        value={
                          formData[categoria.id]
                            ? formatBRLFromCents(formData[categoria.id])
                            : ""
                        }
                      />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex justify-end w-3/4 mx-auto">
          <Button type="submit" className="justify-end" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormBudget;
