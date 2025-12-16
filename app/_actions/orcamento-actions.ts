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

  console.log(
    "Fetched budget for year",
    year,
    ":",
    JSON.stringify(res, null, 2)
  );
  return res;
};
