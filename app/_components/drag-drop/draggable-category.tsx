"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Categoria } from "@/app/_lib/types";
import { cn } from "@/app/_lib/utils";

interface DraggableCategoryProps {
  categoria: Categoria;
  isSelected?: boolean;
  onSelect?: (categoria: Categoria, selected: boolean) => void;
}

export function DraggableCategory({
  categoria,
  isSelected = false,
  onSelect,
}: DraggableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: categoria.id,
      data: {
        categoria,
        type: "categoria",
      },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border bg-white shadow-sm cursor-grab transition-all",
        isDragging && "opacity-50 shadow-lg scale-105",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium truncate flex-1">
        {categoria.nome}
      </span>
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(categoria, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
