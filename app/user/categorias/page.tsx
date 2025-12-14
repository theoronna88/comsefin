"use client";
import { getCategorias } from "@/app/api/api";
import { useEffect, useState } from "react";
import type { Categoria } from "@/app/_lib/types";

const Categorias = () => {
  const [listCategorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (listCategorias.length === 0) {
      getCategorias()
        .then((res) => {
          setCategorias(res.itens);
        })
        .catch((error) => {
          console.error("Erro ao buscar centros de custo:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 md:gap-8 md:p-8">
          {listCategorias.map((categoria) => (
            <>
              <span
                key={categoria.id}
                className="text-lg font-semibold"
              >{`${categoria.tipo} - ${categoria.nome}`}</span>
              {/* 
            
            <ListingCards
                key={categoria.id}
                description={categoria.tipo}
                value={categoria.nome}
              />
            
            */}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categorias;
