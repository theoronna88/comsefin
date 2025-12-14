"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import BudgetActions from "./budget-actions";
import type { Orcamento } from "@/app/_lib/types";

export const columns: ColumnDef<Orcamento>[] = [
  {
    accessorKey: "ano",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-primary hover:bg-transparent"
        >
          Ano
          <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="px-3">{row.original.ano}</div>;
    },
  },
  {
    accessorKey: "actions",
    header: () => {
      return <span className="text-primary justify-end flex px-3">Ações</span>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-end px-3">
          <BudgetActions budget={row.original} />
        </div>
      );
    },
  },
];
