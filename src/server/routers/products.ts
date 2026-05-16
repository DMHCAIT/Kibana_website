import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getProducts, getProductBySlug } from "@/lib/server-data";

export const productsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          gender: z.enum(["men", "women", "unisex"]).optional(),
          limit: z.number().int().min(1).max(60).default(24),
        })
        .default({ limit: 24 }),
    )
    .query(async ({ input }) => {
      let items = await getProducts();
      if (input.category) items = items.filter((p) => p.category === input.category);
      if (input.gender) items = items.filter((p) => p.gender === input.gender);
      return items.slice(0, input.limit);
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => getProductBySlug(input.slug)),

  trending: publicProcedure.query(async () => {
    const items = await getProducts();
    return items.filter((p) => p.isTrending);
  }),
});
