"use client";
import FormBudget from "@/app/_components/form-budget";
import { getCategorias } from "@/app/api/api";
import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
  categoria_pai: string | null;
}

const Budget = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      getCategorias()
        .then((data) => {
          const filteredCategorias = data.itens.filter((categoria: Categoria) =>
            categoria.nome.includes(".")
          );
          setCategorias(filteredCategorias);
        })
        .catch((error) => {
          console.error("Error fetching categorias:", error);
        });
    };

    fetchCategorias();
  }, []);

  return (
    <>
      <FormBudget categorias={categorias} />
    </>
  );
};

export default Budget;
