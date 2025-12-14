import { Card } from "./ui/card";

type ListingCardsProps = {
  data: {
    id: number;
    nome: string;
    codigo: string;
    ativo: boolean;
  }[];
};

const ListingCards = ({ data }: ListingCardsProps) => {
  return (
    <>
      {data.length === 0 ? (
        <p>Nenhum item encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <Card key={item.id} className="p-4">
              <h2 className="text-lg font-semibold">{`${item.codigo}. ${item.nome}`}</h2>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ListingCards;
