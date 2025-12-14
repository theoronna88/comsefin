"use client";
import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import { getApiUrl } from "../api/api";

const ContaAzul = () => {
  const handleClick = () => {
    getApiUrl();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold">Login Conta Azul</h2>
          <p className="text-sm text-muted-foreground">
            Faça login na sua conta Conta Azul.
          </p>
          <Button className="mt-14 rounded-xl" onClick={handleClick}>
            Conta Azul
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContaAzul;
