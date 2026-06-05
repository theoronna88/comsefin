"use server";

import { prisma } from "../_lib/prisma";

export const fetchBudget = async (year: number) => {
  const res = await prisma.orcamentos.findFirst({
    where: {
      ano: year,
    },
    include: {
      valores: {
        include: {
          item: true,
        },
      },
    },
  });

  return res;
};
