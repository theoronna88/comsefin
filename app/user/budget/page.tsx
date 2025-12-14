"use client";

import { getBudget } from "@/app/api/orcamento";
import { useEffect, useState } from "react";
import DataTable from "./data-table";
import { columns } from "./columns";
import { Decimal } from "@prisma/client/runtime/library";
import { getCategorias } from "@/app/api/api";

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  categoria_pai: string | null;
}

interface Budget {
  ano: number;
  id: string;
  valores: {
    item: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      codigo: string;
      descricao: string;
      status: boolean;
    };
    id: string;
    createdAt: Date;
    valor: Decimal;
    orcamentoId: string;
    itemId: string;
  }[];
}

const Budget = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      let categoriasData: Categoria[] = [];
      getCategorias("RECEITA")
        .then((data) => {
          categoriasData = data.itens || [];
          getCategorias("DESPESA").then((dataDespesa) => {
            categoriasData = categoriasData.concat(dataDespesa.itens || []);
            setCategorias(categoriasData);
          });
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
          // console.log("Budget data:", data);
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
