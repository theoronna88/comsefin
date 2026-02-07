"use client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import type { Orcamento } from "@/app/_lib/types";

interface DialogBudgetProps {
  ano: number;
  budgets: Orcamento[];
}

const DialogBudget = ({ ano, budgets }: DialogBudgetProps) => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Button
              className="p-1 m-0 cursor-normal font-normal justify-start w-full"
              variant="ghost"
            >
              Visualizar
            </Button>
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="w-full max-w-4xl h-screen max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-primary">
              Orçamento {ano}
            </DialogTitle>
          </DialogHeader>

          {budgets.map((budget) => (
            <div key={budget.id}>
              <div className="mb-4 ">
                {budget.valores?.map((valor) => (
                  <div
                    className="flex justify-between m-2 border-b border-gray-300"
                    key={valor.item?.id || valor.id}
                  >
                    <span key={valor.item?.id || valor.id}>
                      {valor.item?.descricao}:
                    </span>
                    <span>
                      {Number(valor.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogBudget;
