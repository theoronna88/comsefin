"use client";
import { useState } from "react";
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

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
  categoria_pai: string | null;
}

const FormBudget = ({ categorias }: { categorias: Categoria[] }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 m-4 w-3/4 mx-auto">
          <Label>Selecione o Ano</Label>
          <Select
            name="ano"
            onValueChange={(value) => setFormData({ ...formData, ano: value })}
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
                type="number"
                name={categoria.nome}
                placeholder={categoria.nome}
                onChange={handleChange}
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
