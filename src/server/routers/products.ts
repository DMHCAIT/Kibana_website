import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { products, getProductBySlug } from "@/lib/data";

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
    .query(({ input }) => {
      let items = products;
      if (input.category) items = items.filter((p) => p.category === input.category);
      if (input.gender) items = items.filter((p) => p.gender === input.gender);
      return items.slice(0, input.limit);
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getProductBySlug(input.slug)),

  trending: publicProcedure.query(() => products.filter((p) => p.isTrending)),
});
