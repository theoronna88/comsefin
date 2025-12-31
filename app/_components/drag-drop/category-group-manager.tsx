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
import { useState, useCallback, useTransition } from "react";
import {
  Categoria,
  GrupoDespesa,
  GRUPOS_DESPESAS_GRUPOPNG,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { RotateCcw, Loader2 } from "lucide-react";
import {
  salvarOrganizacaoCategorias,
  resetarOrganizacaoCategorias,
  CategoriaOrganizacaoSalva,
} from "@/app/_actions/categoria-actions";

interface CategoryGroupManagerProps {
  categorias: Categoria[];
  organizacaoSalva?: CategoriaOrganizacaoSalva[];
  // Props de compatibilidade com dashboard (opcional)
  onGroupsChange?: (grupos: GrupoDespesa[]) => void;
  initialGroups?: GrupoDespesa[];
}

export function CategoryGroupManager({
  categorias,
  organizacaoSalva = [],
  onGroupsChange,
  initialGroups,
}: CategoryGroupManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Constrói o estado inicial baseado na organização salva ou initialGroups (dashboard)
  const [grupos, setGrupos] = useState<GrupoDespesa[]>(() => {
    // Se initialGroups foi passado (modo dashboard), usa ele
    if (initialGroups) {
      return initialGroups;
    }

    // Caso contrário, constrói a partir da organização salva
    const gruposIniciais = GRUPOS_DESPESAS_GRUPOPNG.map((g) => ({
      ...g,
      categorias: [] as Categoria[],
    }));

    // Distribui as categorias nos grupos baseado na organização salva
    for (const cat of categorias) {
      const assoc = organizacaoSalva.find(
        (o) => o.contaAzulCategoryId === cat.id
      );
      if (assoc) {
        const grupo = gruposIniciais.find((g) => g.id === assoc.grupoId);
        if (grupo) {
          grupo.categorias.push({ ...cat, ordem: assoc.ordem } as Categoria & {
            ordem: number;
          });
        }
      }
    }

    // Ordena as categorias dentro de cada grupo
    gruposIniciais.forEach((g) =>
      g.categorias.sort(
        (a, b) =>
          ((a as Categoria & { ordem?: number }).ordem ?? 0) -
          ((b as Categoria & { ordem?: number }).ordem ?? 0)
      )
    );

    return gruposIniciais;
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

  // Função auxiliar para salvar a organização no banco
  const persistirOrganizacao = useCallback(
    (gruposAtualizados: GrupoDespesa[]) => {
      // Chama callback do dashboard se disponível
      onGroupsChange?.(gruposAtualizados);

      // Persiste no banco (apenas se não estiver no modo dashboard)
      if (!initialGroups) {
        const payload = gruposAtualizados.map((grupo) => ({
          groupId: grupo.id,
          contaAzulCategoryIds: grupo.categorias.map((cat) => cat.id),
        }));

        startTransition(async () => {
          await salvarOrganizacaoCategorias(payload);
        });
      }
    },
    [onGroupsChange, initialGroups]
  );

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
      persistirOrganizacao(novosGrupos);
    },
    [categorias, grupos, persistirOrganizacao]
  );

  const handleRemoveCategoria = useCallback(
    (categoriaId: string) => {
      const novosGrupos = grupos.map((grupo) => ({
        ...grupo,
        categorias: grupo.categorias.filter((c) => c.id !== categoriaId),
      }));
      setGrupos(novosGrupos);
      persistirOrganizacao(novosGrupos);
    },
    [grupos, persistirOrganizacao]
  );

  const handleReset = useCallback(() => {
    const gruposVazios = GRUPOS_DESPESAS_GRUPOPNG.map((g) => ({
      ...g,
      categorias: [] as Categoria[],
    }));

    // Se está no modo dashboard, apenas atualiza estado local e callback
    if (initialGroups) {
      setGrupos(gruposVazios);
      onGroupsChange?.(gruposVazios);
      setIsResetDialogOpen(false);
      return;
    }

    // Modo página de categorias: persiste no banco
    startTransition(async () => {
      await resetarOrganizacaoCategorias();
      setGrupos(gruposVazios);
      setIsResetDialogOpen(false);
    });
  }, [initialGroups, onGroupsChange]);

  return (
    <>
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
                <CardTitle className="text-base flex items-center gap-2">
                  Categorias Disponíveis
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResetDialogOpen(true)}
                  className="h-8"
                  disabled={isPending}
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
                    <DraggableCategory
                      key={categoria.id}
                      categoria={categoria}
                    />
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
              <span className="text-sm font-medium">
                {activeCategoria.nome}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Diálogo de confirmação para reset */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Organização</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja resetar a organização das categorias? Todas
              as categorias serão removidas dos grupos e você precisará
              reorganizá-las novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetando...
                </>
              ) : (
                "Confirmar Reset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
