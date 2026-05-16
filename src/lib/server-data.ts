import { db } from "@/lib/db";
import {
  products as productsTable,
  categories as categoriesTable,
  orders as ordersTable,
  users as usersTable,
  siteConfig as siteConfigTable,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Product } from "@/types/product";
import { products as localProducts } from "@/lib/data";
import localCategories from "@/data/categories.json";
import localSiteConfig from "@/data/site-config.json";

const hasDatabase = !!process.env.DATABASE_URL;

// ── Products ─────────────────────────────────────────────────────────────────

function rowToProduct(row: typeof productsTable.$inferSelect): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    image: row.image,
    gallery: (row.gallery as string[]) ?? [],
    category: row.category as Product["category"],
    gender: row.gender as Product["gender"],
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    isTrending: row.isTrending,
    colors: (row.colors as string[]) ?? [],
    colorVariants: (row.colorVariants as Product["colorVariants"]) ?? [],
    features: (row.features as string[]) ?? [],
    specs: (row.specs as Record<string, string>) ?? {},
    rating: row.rating ?? 0,
    reviewCount: row.reviewCount ?? 0,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasDatabase) return localProducts;
  try {
    const rows = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.sortOrder));
    return rows.length ? rows.map(rowToProduct) : localProducts;
  } catch {
    return localProducts;
  }
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id));
  return row ? rowToProduct(row) : undefined;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, slug));
  return row ? rowToProduct(row) : undefined;
}

export async function saveProduct(product: Product & { order?: number }): Promise<void> {
  const row = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    image: product.image,
    gallery: product.gallery as string[],
    category: product.category,
    gender: product.gender,
    isNew: product.isNew ?? false,
    isBestSeller: product.isBestSeller ?? false,
    isTrending: product.isTrending ?? false,
    colors: product.colors as string[],
    colorVariants: product.colorVariants as unknown[],
    features: product.features as string[],
    specs: product.specs as Record<string, string>,
    rating: product.rating,
    reviewCount: product.reviewCount,
    sortOrder: product.order ?? 999,
    updatedAt: new Date(),
  };
  await db
    .insert(productsTable)
    .values(row)
    .onConflictDoUpdate({ target: productsTable.id, set: row });
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete(productsTable).where(eq(productsTable.id, id));
}

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) =>
      db
        .update(productsTable)
        .set({ sortOrder: i + 1 })
        .where(eq(productsTable.id, id))
    )
  );
}

// ── Categories ───────────────────────────────────────────────────────────────

export type AdminCategory = { slug: string; name: string; image: string; order: number };

function rowToCategory(row: typeof categoriesTable.$inferSelect): AdminCategory {
  return {
    slug: row.slug,
    name: row.name,
    image: row.image,
    order: row.sortOrder,
  };
}

export async function getCategories(): Promise<AdminCategory[]> {
  if (!hasDatabase) return localCategories as AdminCategory[];
  try {
    const rows = await db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder));
    return rows.length ? rows.map(rowToCategory) : (localCategories as AdminCategory[]);
  } catch {
    return localCategories as AdminCategory[];
  }
}

export async function saveCategory(cat: AdminCategory): Promise<void> {
  const row = { slug: cat.slug, name: cat.name, image: cat.image, sortOrder: cat.order };
  await db
    .insert(categoriesTable)
    .values(row)
    .onConflictDoUpdate({ target: categoriesTable.slug, set: row });
}

export async function deleteCategory(slug: string): Promise<void> {
  await db.delete(categoriesTable).where(eq(categoriesTable.slug, slug));
}

export async function reorderCategories(orderedSlugs: string[]): Promise<void> {
  await Promise.all(
    orderedSlugs.map((slug, i) =>
      db
        .update(categoriesTable)
        .set({ sortOrder: i + 1 })
        .where(eq(categoriesTable.slug, slug))
    )
  );
}

// ── Site Config ───────────────────────────────────────────────────────────────

export type SiteConfig = {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    images: string[];
  };
  sections: { id: string; label: string; visible: boolean; order: number }[];
  theme: {
    primaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
  };
  announcementBar: string;
  sectionProducts: Record<string, string[]>;
  pages: {
    about: {
      title: string;
      subtitle: string;
      content: string;
      heroImage: string;
      stats: { number: string; label: string }[];
    };
    contact: {
      title: string;
      subtitle: string;
      email: string;
      phone: string;
      address: string;
      instagram: string;
      twitter: string;
      responseTime: string;
    };
    faqs: {
      title: string;
      subtitle: string;
      items: { id: string; question: string; answer: string }[];
    };
    returns: {
      title: string;
      subtitle: string;
      sections: { id: string; heading: string; content: string }[];
    };
    shop: {
      title: string;
      subtitle: string;
      bannerImage: string;
    };
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_SITE_CONFIG: SiteConfig = {
  hero: {
    title: "Kibana",
    subtitle: "Pure. Minimal. Luxe.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    images: [],
  },
  sections: [],
  theme: {
    primaryColor: "#1a1a1a",
    accentColor: "#c8a96e",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
  },
  announcementBar: "",
  sectionProducts: {},
  pages: {
    about: { title: "About Us", subtitle: "", content: "", heroImage: "", stats: [] },
    contact: {
      title: "Contact",
      subtitle: "",
      email: "",
      phone: "",
      address: "",
      instagram: "",
      twitter: "",
      responseTime: "",
    },
    faqs: { title: "FAQs", subtitle: "", items: [] },
    returns: { title: "Returns", subtitle: "", sections: [] },
    shop: { title: "Shop", subtitle: "", bannerImage: "" },
  },
};

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!hasDatabase) return localSiteConfig as unknown as SiteConfig;
  try {
    const [row] = await db
      .select()
      .from(siteConfigTable)
      .where(eq(siteConfigTable.key, "config"));
    if (!row) return localSiteConfig as unknown as SiteConfig;
    return row.value as unknown as SiteConfig;
  } catch {
    return localSiteConfig as unknown as SiteConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const row = {
    key: "config",
    value: config as unknown as Record<string, unknown>,
    updatedAt: new Date(),
  };
  await db
    .insert(siteConfigTable)
    .values(row)
    .onConflictDoUpdate({ target: siteConfigTable.key, set: row });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loginAt: string;
  loginCount: number;
  registeredAt?: string;
};

function rowToUser(row: typeof usersTable.$inferSelect): AdminUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    loginAt: row.loginAt.toISOString(),
    loginCount: row.loginCount,
    registeredAt: row.registeredAt.toISOString(),
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  if (!hasDatabase) return [];
  try {
    const rows = await db.select().from(usersTable);
    return rows.map(rowToUser);
  } catch {
    return [];
  }
}

export async function recordUserLogin(user: {
  id: string;
  name: string;
  phone: string;
}): Promise<void> {
  const now = new Date();
  // Try insert first, then update count on conflict
  const [existing] = await db
    .select({ loginCount: usersTable.loginCount })
    .from(usersTable)
    .where(eq(usersTable.id, user.id));

  if (existing) {
    await db
      .update(usersTable)
      .set({ loginAt: now, loginCount: existing.loginCount + 1 })
      .where(eq(usersTable.id, user.id));
  } else {
    await db.insert(usersTable).values({
      id: user.id,
      name: user.name,
      phone: user.phone,
      loginAt: now,
      loginCount: 1,
      registeredAt: now,
    });
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type AdminOrder = {
  id: string;
  user: { name: string; phone: string; email?: string } | null;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
  }[];
  total: number;
  placedAt: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "refunded";
  trackingId?: string | null;
};

function rowToOrder(row: typeof ordersTable.$inferSelect): AdminOrder {
  return {
    id: row.id,
    user: row.user as AdminOrder["user"],
    items: (row.items as AdminOrder["items"]) ?? [],
    total: row.total,
    placedAt: row.placedAt.toISOString(),
    status: row.status as AdminOrder["status"],
    shippingAddress: row.shippingAddress ?? undefined,
    paymentMethod: row.paymentMethod ?? undefined,
    paymentStatus: (row.paymentStatus as AdminOrder["paymentStatus"]) ?? undefined,
    trackingId: row.trackingId,
  };
}

export async function getOrders(): Promise<AdminOrder[]> {
  if (!hasDatabase) return [];
  try {
    const rows = await db.select().from(ordersTable);
    return rows.map(rowToOrder);
  } catch {
    return [];
  }
}

export async function saveOrder(order: AdminOrder): Promise<void> {
  const row = {
    id: order.id,
    user: order.user,
    items: order.items,
    total: order.total,
    status: order.status,
    shippingAddress: order.shippingAddress ?? null,
    paymentMethod: order.paymentMethod ?? null,
    paymentStatus: (order.paymentStatus ?? null) as "paid" | "pending" | "refunded" | null,
    trackingId: order.trackingId ?? null,
    placedAt: new Date(order.placedAt),
  };
  await db
    .insert(ordersTable)
    .values(row)
    .onConflictDoUpdate({ target: ordersTable.id, set: row });
}

export async function updateOrderStatus(
  id: string,
  status: AdminOrder["status"]
): Promise<void> {
  await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id));
}

// ── Revenue helpers ───────────────────────────────────────────────────────────

export type RevenueStats = {
  totalRevenue: number;
  deliveredRevenue: number;
  pendingRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueByProduct: { name: string; revenue: number; units: number }[];
  revenueByPaymentMethod: Record<string, number>;
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topCustomers: {
    name: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
  }[];
};

export async function getRevenueStats(): Promise<RevenueStats> {
  const orders = await getOrders();
  const delivered = orders.filter((o) => o.status === "delivered");
  const active = orders.filter((o) => o.status !== "cancelled");

  const totalRevenue = delivered.reduce((s, o) => s + o.total, 0);
  const deliveredRevenue = totalRevenue;
  const pendingRevenue = active
    .filter((o) => o.status !== "delivered")
    .reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = active.length
    ? Math.round(active.reduce((s, o) => s + o.total, 0) / active.length)
    : 0;

  const productMap: Record<string, { name: string; revenue: number; units: number }> = {};
  delivered.forEach((o) => {
    o.items.forEach((item) => {
      if (!productMap[item.productId])
        productMap[item.productId] = { name: item.name, revenue: 0, units: 0 };
      productMap[item.productId].revenue += item.price * item.quantity;
      productMap[item.productId].units += item.quantity;
    });
  });
  const revenueByProduct = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const paymentMap: Record<string, number> = {};
  active.forEach((o) => {
    const m = o.paymentMethod ?? "Unknown";
    paymentMap[m] = (paymentMap[m] ?? 0) + o.total;
  });

  const monthMap: Record<string, { revenue: number; orders: number }> = {};
  active.forEach((o) => {
    const d = new Date(o.placedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { revenue: 0, orders: 0 };
    monthMap[key].revenue += o.total;
    monthMap[key].orders += 1;
  });
  const revenueByMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));

  const customerMap: Record<
    string,
    { name: string; phone: string; totalSpent: number; orderCount: number }
  > = {};
  delivered.forEach((o) => {
    if (!o.user) return;
    const key = o.user.phone;
    if (!customerMap[key])
      customerMap[key] = {
        name: o.user.name,
        phone: o.user.phone,
        totalSpent: 0,
        orderCount: 0,
      };
    customerMap[key].totalSpent += o.total;
    customerMap[key].orderCount += 1;
  });
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    totalRevenue,
    deliveredRevenue,
    pendingRevenue,
    totalOrders,
    avgOrderValue,
    revenueByProduct,
    revenueByPaymentMethod: paymentMap,
    revenueByMonth,
    topCustomers,
  };
}
