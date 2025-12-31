"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import { useState, useCallback } from "react";
import { toast } from "sonner";
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
  const [isPending, setIsPending] = useState(false);
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

  // Estratégia de colisão customizada: tenta pointerWithin primeiro, depois rectIntersection
  const collisionDetection: CollisionDetection = useCallback((args) => {
    // Primeiro tenta pointerWithin (mais preciso quando o ponteiro está dentro da área)
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // Fallback para rectIntersection (detecta sobreposição de retângulos)
    return rectIntersection(args);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const categoria = active.data.current?.categoria as Categoria;
    if (categoria) {
      setActiveCategoria(categoria);
    }
  }, []);

  // Função auxiliar para salvar a organização no banco
  const persistirOrganizacao = useCallback(
    async (gruposAtualizados: GrupoDespesa[]) => {
      console.log("[persistirOrganizacao] Chamado");

      // Chama callback do dashboard se disponível
      onGroupsChange?.(gruposAtualizados);

      // Sempre persiste no banco (organização é global)
      console.log("[persistirOrganizacao] Vai persistir no banco");
      setIsPending(true);

      const payload = gruposAtualizados.map((grupo) => ({
        groupId: grupo.id,
        contaAzulCategoryIds: grupo.categorias.map((cat) => cat.id),
      }));

      console.log("[persistirOrganizacao] Payload a ser enviado:", JSON.stringify(payload));

      try {
        console.log("[persistirOrganizacao] Chamando salvarOrganizacaoCategorias...");
        const result = await salvarOrganizacaoCategorias(payload);
        console.log("[persistirOrganizacao] Resultado:", result);
        if (result.success) {
          toast.success("Organização salva!");
        } else {
          toast.error("Erro ao salvar organização");
        }
      } catch (error) {
        console.error("[persistirOrganizacao] Erro:", error);
        toast.error("Erro ao salvar organização");
      } finally {
        setIsPending(false);
      }
    },
    [onGroupsChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCategoria(null);

      console.log("[handleDragEnd] active:", active.id, "over:", over?.id);

      if (!over || active.id === over.id) {
        console.log("[handleDragEnd] Retornando sem ação - over:", over, "active.id === over.id:", active.id === over?.id);
        return;
      }

      const categoriaId = active.id as string;
      const grupoDestinoId = over.id as string;

      const categoriaArrastada =
        categorias.find((c) => c.id === categoriaId) ||
        grupos.flatMap((g) => g.categorias).find((c) => c.id === categoriaId);

      if (!categoriaArrastada) return;

      const grupoOrigem = grupos.find((g) =>
        g.categorias.some((c) => c.id === categoriaId)
      );

      // Calcula o novo estado dos grupos
      let novosGrupos = [...grupos];
      // 1. Remove a categoria do grupo de origem (se houver)
      if (grupoOrigem) {
        novosGrupos = novosGrupos.map((g) =>
          g.id === grupoOrigem.id
            ? {
                ...g,
                categorias: g.categorias.filter((c) => c.id !== categoriaId),
              }
            : g
        );
      }
      // 2. Adiciona a categoria ao grupo de destino
      novosGrupos = novosGrupos.map((g) =>
        g.id === grupoDestinoId
          ? {
              ...g,
              categorias: [...g.categorias, categoriaArrastada],
            }
          : g
      );

      // Atualiza o estado
      setGrupos(novosGrupos);

      console.log("[handleDragEnd] novosGrupos:", JSON.stringify(novosGrupos.map(g => ({ id: g.id, categorias: g.categorias.map(c => c.id) }))));

      // Chama a persistência com o estado atualizado (side effect)
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

  const handleReset = useCallback(async () => {
    const gruposVazios = GRUPOS_DESPESAS_GRUPOPNG.map((g) => ({
      ...g,
      categorias: [] as Categoria[],
    }));

    setIsPending(true);
    try {
      // Sempre persiste no banco (organização é global)
      await resetarOrganizacaoCategorias();
      setGrupos(gruposVazios);
      onGroupsChange?.(gruposVazios);
      setIsResetDialogOpen(false);
      toast.success("Organização resetada!");
    } catch (error) {
      console.error("[handleReset] Erro:", error);
      toast.error("Erro ao resetar organização");
    } finally {
      setIsPending(false);
    }
  }, [onGroupsChange]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
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
