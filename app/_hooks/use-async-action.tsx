"use client";

import { useState, useCallback } from "react";

/**
 * Hook para gerenciar estado de loading de ações assíncronas
 * Previne cliques duplos e fornece feedback visual automático
 * 
 * @example
 * const { execute, isLoading } = useAsyncAction();
 * 
 * const handleSubmit = () => {
 *   execute(async () => {
 *     await saveData();
 *     toast.success("Salvo!");
 *   });
 * };
 * 
 * <Button onClick={handleSubmit} disabled={isLoading}>
 *   {isLoading ? "Salvando..." : "Salvar"}
 * </Button>
 */
export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async <T,>(
    action: () => Promise<T>
  ): Promise<T | undefined> => {
    // Previne execução se já está processando
    if (isLoading) {
      console.warn("[useAsyncAction] Ação já em execução, ignorando...");
      return;
    }

    setIsLoading(true);

    try {
      const result = await action();
      return result;
    } catch (error) {
      // Re-lança o erro para que o componente possa tratá-lo
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    execute,
    isLoading,
  };
}
