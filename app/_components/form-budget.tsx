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
} from "./ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { saveBudget } from "../api/api";
import Budget from "../user/budget/page";
import { toast } from "sonner";

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
}

const FormBudget = ({
  categorias,
  budget,
  onClose,
}: {
  categorias: Categoria[];
  budget: Budget | null;
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

    const data = {
      id: budget?.id,
      ano: formData?.ano,
      categorias: Object.entries(formData)
        .filter(([key]) => key !== "ano")
        .map(([nome, valor]) => ({
          nome,
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
        ano: budget.ano.toString(),
      };
      budget.valores.forEach((valor) => {
        existingData[valor.item.descricao] = valor.valor.toString();
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
            name="ano"
            onValueChange={(value) => setFormData({ ...formData, ano: value })}
            value={`${formData.ano}`}
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
          {categorias.map((categoria) => (
            <div key={categoria.id}>
              <Label htmlFor={categoria.nome}>{categoria.nome}</Label>
              <Input
                type="text"
                name={categoria.nome}
                placeholder={categoria.nome}
                onChange={handleChange}
                value={formData[categoria.nome] || ""}
              />
            </div>
          ))}
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
