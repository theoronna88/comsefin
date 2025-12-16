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
import type { Categoria, Orcamento } from "@/app/_lib/types";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
          valor: Number(valor.replace(",", ".")),
        })),
    };
    saveBudget(data)
      .then(() => {
        toast.success("Orçamento salvo com sucesso!");
        setFormData({});
        window.location.href = "/user/budget";

        onClose();
      })
      .catch((error) => {
        toast.error("Erro ao salvar o orçamento. ", {
          description: error.message,
        });
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
          existingData[categoriaId] = String(valor.valor);
        }
      });
      setFormData(existingData);
      setFirstPass(false);
    }
  }, [budget, firstPass]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 m-4 w-3/4 mx-auto">
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
                      name={categoria.id}
                      placeholder={categoria.nome}
                      onChange={handleChange}
                      value={formData[categoria.id] || ""}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="bg-red-50">
              {/* Despesas */}
              {categorias
                .filter((cat) => cat.tipo === "DESPESA")
                .map((categoria) => (
                  <div key={categoria.id}>
                    <Label htmlFor={categoria.nome}>{categoria.nome}</Label>
                    <Input
                      type="text"
                      name={categoria.id}
                      placeholder={categoria.nome}
                      onChange={handleChange}
                      value={formData[categoria.id] || ""}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-3/4 mx-auto">
          <Button type="submit" className="justify-end">
            Salvar
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormBudget;
