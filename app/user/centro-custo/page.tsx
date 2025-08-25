"use client";
import ListingCards from "@/app/_components/listing-cards";
import { getCentroCusto } from "@/app/api/api";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CentrodeCusto = {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
};
const CentrodeCustoPage = () => {
  const [listCentrodeCusto, setListCentrodeCusto] = useState<CentrodeCusto[]>(
    []
  );

  useEffect(() => {
    const fetchCentroCusto = async () => {
      try {
        const session = await getSession();
        const sessionId = session?.user?.id;

        if (sessionId && listCentrodeCusto.length === 0) {
          const res = await getCentroCusto(sessionId);
          setListCentrodeCusto(res.itens);
        }
      } catch (err) {
        console.log(err);
        toast.error("Erro ao buscar centros de custo");
      }
    };

    fetchCentroCusto();
  }, [listCentrodeCusto.length]);

  return (
    <div className="p-4">
      {listCentrodeCusto.length === 0 && (
        <p>Nenhum centro de custo encontrado.</p>
      )}
      <ListingCards data={listCentrodeCusto} />
    </div>
  );
};

export default CentrodeCustoPage;
