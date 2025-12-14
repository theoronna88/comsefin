"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useState, useCallback } from "react";
import {
  Categoria,
  GrupoDespesa,
  GRUPOS_DESPESAS_PADRAO,
} from "@/app/_lib/types";
import { DraggableCategory } from "./draggable-category";
import { CategoryDropZone } from "./category-drop-zone";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { RotateCcw } from "lucide-react";

interface CategoryGroupManagerProps {
  categorias: Categoria[];
  onGroupsChange: (grupos: GrupoDespesa[]) => void;
  initialGroups?: GrupoDespesa[];
}

export function CategoryGroupManager({
  categorias,
  onGroupsChange,
  initialGroups,
}: CategoryGroupManagerProps) {
  const [grupos, setGrupos] = useState<GrupoDespesa[]>(() => {
    if (initialGroups) return initialGroups;
    return GRUPOS_DESPESAS_PADRAO.map((g) => ({ ...g, categorias: [] }));
  });

  const [activeCategoria, setActiveCategoria] = useState<Categoria | null>(
    null
  );

  // Categorias não agrupadas (ainda disponíveis para drag)
  const categoriasNaoAgrupadas = categorias.filter(
    (cat) => !grupos.some((g) => g.categorias.some((c) => c.id === cat.id))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const categoria = active.data.current?.categoria as Categoria;
    if (categoria) {
      setActiveCategoria(categoria);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCategoria(null);

      if (!over) return;

      const categoriaId = active.id as string;
      const grupoDestinoId = over.id as string;

      // Encontrar a categoria arrastada
      const categoriaArrastada =
        categorias.find((c) => c.id === categoriaId) ||
        grupos.flatMap((g) => g.categorias).find((c) => c.id === categoriaId);

      if (!categoriaArrastada) return;

      // Verificar se o destino é um grupo válido
      const grupoDestino = grupos.find((g) => g.id === grupoDestinoId);
      if (!grupoDestino) return;

      // Verificar se a categoria já está nesse grupo
      if (grupoDestino.categorias.some((c) => c.id === categoriaId)) return;

      // Atualizar os grupos
      const novosGrupos = grupos.map((grupo) => {
        // Remover a categoria de qualquer grupo que ela esteja
        const categoriasAtualizadas = grupo.categorias.filter(
          (c) => c.id !== categoriaId
        );

        // Adicionar ao grupo de destino
        if (grupo.id === grupoDestinoId) {
          return {
            ...grupo,
            categorias: [...categoriasAtualizadas, categoriaArrastada],
          };
        }

        return { ...grupo, categorias: categoriasAtualizadas };
      });

      setGrupos(novosGrupos);
      onGroupsChange(novosGrupos);
    },
    [categorias, grupos, onGroupsChange]
  );

  const handleRemoveCategoria = useCallback(
    (categoriaId: string) => {
      const novosGrupos = grupos.map((grupo) => ({
        ...grupo,
        categorias: grupo.categorias.filter((c) => c.id !== categoriaId),
      }));
      setGrupos(novosGrupos);
      onGroupsChange(novosGrupos);
    },
    [grupos, onGroupsChange]
  );

  const handleReset = useCallback(() => {
    const gruposVazios = GRUPOS_DESPESAS_PADRAO.map((g) => ({
      ...g,
      categorias: [],
    }));
    setGrupos(gruposVazios);
    onGroupsChange(gruposVazios);
  }, [onGroupsChange]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6">
        {/* Categorias não agrupadas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Categorias Disponíveis
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Resetar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {categoriasNaoAgrupadas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Todas as categorias foram agrupadas!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categoriasNaoAgrupadas.map((categoria) => (
                  <DraggableCategory key={categoria.id} categoria={categoria} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zonas de drop para cada grupo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <CategoryDropZone
              key={grupo.id}
              id={grupo.id}
              nome={grupo.nome}
              cor={grupo.cor}
              categorias={grupo.categorias}
              onRemoveCategoria={handleRemoveCategoria}
            />
          ))}
        </div>
      </div>

      {/* Overlay para o item sendo arrastado */}
      <DragOverlay>
        {activeCategoria ? (
          <div className="px-3 py-2 rounded-lg border bg-white shadow-lg cursor-grabbing">
            <span className="text-sm font-medium">{activeCategoria.nome}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
