import { getCategorias } from "@/app/api/api";
import { getOrganizacaoCategorias } from "@/app/_actions/categoria-actions";
import { CategoryGroupManager } from "@/app/_components/drag-drop/category-group-manager";

export default async function CategoriasPage() {
  const [categoriasResponse, organizacaoSalva] = await Promise.all([
    getCategorias(),
    getOrganizacaoCategorias(),
  ]);

  const categorias = categoriasResponse.itens;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Organização de Categorias</h1>
          <p className="text-muted-foreground">
            Arraste as categorias para os grupos desejados. A organização é
            salva automaticamente.
          </p>
        </div>

        <CategoryGroupManager
          categorias={categorias}
          organizacaoSalva={organizacaoSalva}
        />
      </div>
    </div>
  );
}
