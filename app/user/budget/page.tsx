"use client";
import { getBudget, getCategorias } from "@/app/api/api";
import { useEffect, useState } from "react";
import DataTable from "./data-table";
import { columns } from "./columns";

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
  categoria_pai: string | null;
}

interface Budget {
  ano: number;
  id: string;
  valores: {
    item: {
      id: number;
      descricao: string;
      codigo: string;
    };
    valor: number;
  };
}

const Budget = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

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

    if (categorias.length === 0) {
      fetchCategorias();
    }

    const fetchBudget = async () => {
      getBudget()
        .then((data) => {
          console.log("Budget data:", data);
          setBudgets(data);
        })
        .catch((error) => {
          console.error("Error fetching budget:", error);
        });
    };

    if (budgets.length === 0) {
      fetchBudget();
    }
  }, [budgets.length, categorias.length]);

  return (
    <>
      <div className="flex flex-col gap-4 p-8">
        <DataTable columns={columns} data={budgets} categorias={categorias} />
      </div>
    </>
  );
};

export default Budget;
