import { config } from "dotenv";
import postgres from "postgres";
import { HomepageRanksSchema } from "../src/types/product";

config({ path: ".env.local" });

async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });
  try {
    const result = await client.begin(async (transaction) => {
      await transaction`SELECT pg_advisory_xact_lock(7319042)`;
      const updated = await transaction`
        UPDATE products
        SET color_variants = (
          SELECT jsonb_agg(
            CASE WHEN variant ? 'homepageRanks' THEN variant
              ELSE variant || '{"homepageRanks": {}}'::jsonb END
            ORDER BY position
          )
          FROM jsonb_array_elements(color_variants) WITH ORDINALITY AS colors(variant, position)
        ), updated_at = NOW()
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(color_variants) AS variant
          WHERE NOT (variant ? 'homepageRanks')
        )
        RETURNING id
      `;
      const rows = await transaction<{ color_variants: { homepageRanks: unknown }[] }[]>`
        SELECT color_variants FROM products
      `;
      let variants = 0;
      for (const row of rows) {
        for (const variant of row.color_variants) {
          HomepageRanksSchema.parse(variant.homepageRanks);
          variants++;
        }
      }
      return { updatedProducts: updated.length, checkedVariants: variants };
    });
    console.log(
      `Homepage rank migration complete: ${result.updatedProducts} products updated; ${result.checkedVariants} variants verified.`,
    );
    console.log(
      "Existing ranks and tags were preserved. No homepage positions were assigned automatically.",
    );
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(
    "Homepage rank migration failed:",
    error instanceof Error ? error.message : "Unknown database error",
  );
  process.exitCode = 1;
});
