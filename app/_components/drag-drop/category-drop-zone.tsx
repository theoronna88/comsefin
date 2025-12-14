"use client";

import { useDroppable } from "@dnd-kit/core";
import { Categoria } from "@/app/_lib/types";
import { cn } from "@/app/_lib/utils";
import { X } from "lucide-react";

interface CategoryDropZoneProps {
  id: string;
  nome: string;
  cor: string;
  categorias: Categoria[];
  onRemoveCategoria?: (categoriaId: string) => void;
}

export function CategoryDropZone({
  id,
  nome,
  cor,
  categorias,
  onRemoveCategoria,
}: CategoryDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: "grupo",
      grupoId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col p-4 rounded-xl border-2 border-dashed min-h-[120px] transition-all",
        isOver
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-gray-300 bg-gray-50"
      )}
      style={{
        borderColor: isOver ? undefined : cor,
        backgroundColor: isOver ? undefined : `${cor}10`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: cor }}
        />
        <h3 className="font-semibold text-sm">{nome}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {categorias.length}{" "}
          {categorias.length === 1 ? "categoria" : "categorias"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 flex-1">
        {categorias.length === 0 ? (
          <p className="text-xs text-muted-foreground italic w-full text-center my-auto">
            Arraste categorias para cá
          </p>
        ) : (
          categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white border shadow-sm"
              style={{ borderColor: cor }}
            >
              <span className="truncate max-w-[150px]">{categoria.nome}</span>
              {onRemoveCategoria && (
                <button
                  type="button"
                  onClick={() => onRemoveCategoria(categoria.id)}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
