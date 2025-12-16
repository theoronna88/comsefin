"use client";
import DialogBudgetForm from "@/app/_components/dialog-budget-form";
import DialogBudget from "@/app/_components/dialog-show-budget";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { deleteBudget, getCategorias } from "@/app/api/api";
import { MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Categoria, Orcamento } from "@/app/_lib/types";

const BudgetActions = ({ budget }: { budget: Orcamento }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const handleClose = () => {
    setIsOpen(false);
    setIsEdit(false);
  };

  const handleDelete = async () => {
    // Chama a função de exclusão do orçamento
    await deleteBudget(budget.id)
      .then(() => {
        toast.success("Orçamento excluído com sucesso!");
      })
      .catch((error) => {
        console.error("Error deleting budget:", error);
        toast.error("Erro ao excluir o orçamento.");
      });

    setTimeout(() => {
      window.location.href = "/user/budget";
    }, 1500);
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const receitaData = await getCategorias("RECEITA");
        const despesaData = await getCategorias("DESPESA");
        const todasCategorias = [
          ...(receitaData.itens || []),
          ...(despesaData.itens || []),
        ];
        setCategorias(todasCategorias);
      } catch (error) {
        console.error("Error fetching categorias:", error);
      }
    };

    if (categorias.length === 0) {
      fetchCategorias();
    }
  }, [categorias.length]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DialogBudget ano={budget.ano} budgets={[budget]} />
          <DropdownMenuItem>
            <Button
              variant="ghost"
              className="m-0 p-1 font-normal cursor-default w-full justify-start"
              onClick={() => {
                setIsOpen(true);
                setIsEdit(true);
              }}
            >
              Editar
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              className="m-0 p-1 font-normal cursor-default w-full justify-start"
              onClick={() => {
                handleDelete();
              }}
            >
              Excluir
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogBudgetForm
        isOpen={isOpen}
        onClose={handleClose}
        categorias={categorias}
        budget={budget}
        isEdit={isEdit}
      />
    </>
  );
};

export default BudgetActions;
