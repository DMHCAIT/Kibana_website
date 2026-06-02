import { db } from "@/lib/db";
import {
  products as productsTable,
  categories as categoriesTable,
  orders as ordersTable,
  users as usersTable,
  siteConfig as siteConfigTable,
  contactMessages as contactMessagesTable,
  userCart as userCartTable,
} from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import type { Product } from "@/types/product";
import { products as localProducts } from "@/lib/data";
import localCategories from "@/data/categories.json";
import localSiteConfig from "@/data/site-config.json";

const hasDatabase = !!process.env.DATABASE_URL;

// In-memory cache for frequently accessed data
const dataCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

function getCached(key: string): unknown | null {
  const entry = dataCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    dataCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: unknown, ttlMs: number = 60000) {
  dataCache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

// Export function to invalidate cache
export function invalidateCache(key?: string) {
  if (key) {
    dataCache.delete(key);
  } else {
    dataCache.clear();
  }
}

/** Races a DB promise against a timeout; resolves with null on timeout/error. */
function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T | null> {
  return Promise.race([
    promise.catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

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
    video: row.video ?? undefined,
    rating: row.rating ?? 0,
    reviewCount: row.reviewCount ?? 0,
  };
}

export async function getProducts(): Promise<Product[]> {
  // Check cache first (60 second TTL)
  const cached = getCached("products");
  if (cached) return cached as Product[];

  if (!hasDatabase) {
    setCached("products", localProducts, 60000);
    return localProducts;
  }

  const rows = await withTimeout(
    db.select().from(productsTable).orderBy(asc(productsTable.sortOrder))
  );
  const result = rows ? rows.map(rowToProduct) : localProducts;
  setCached("products", result, 60000); // Cache for 1 minute
  return result;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (!hasDatabase) return localProducts.find((p) => p.id === id);
  try {
    const [row] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    if (row) return rowToProduct(row);
    return localProducts.find((p) => p.id === id);
  } catch {
    return localProducts.find((p) => p.id === id);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!hasDatabase) return localProducts.find((p) => p.slug === slug);
  try {
    const [row] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug));
    if (row) return rowToProduct(row);
    return localProducts.find((p) => p.slug === slug);
  } catch {
    return localProducts.find((p) => p.slug === slug);
  }
}

export async function saveProduct(product: Product & { order?: number; video?: string; inStock?: boolean }): Promise<void> {
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
    inStock: product.inStock ?? true,
    colors: product.colors as string[],
    colorVariants: product.colorVariants as unknown[],
    features: product.features as string[],
    specs: product.specs as Record<string, string>,
    video: product.video ?? null,
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
  const rows = await withTimeout(
    db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder))
  );
  return rows && rows.length ? rows.map(rowToCategory) : (localCategories as AdminCategory[]);
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
  sectionContent?: {
    bestSellers?: {
      leftImage?: string;
      rightImage?: string;
      heading?: string;
      buttonText?: string;
      productSlug?: string;
    };
    craftsmanship?: {
      image?: string;
      text?: string;
    };
  };
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
      responseTime: string;
      socialLinks: { id: string; platform: string; url: string; label: string }[];
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
      responseTime: "",
      socialLinks: [],
    },
    faqs: { title: "FAQs", subtitle: "", items: [] },
    returns: { title: "Returns", subtitle: "", sections: [] },
    shop: { title: "Shop", subtitle: "", bannerImage: "" },
  },
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const fallback = localSiteConfig as unknown as SiteConfig;
  if (!hasDatabase) return fallback;
  try {
    const result = await withTimeout(
      db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "config"))
    );
    if (!result) return fallback;
    const [row] = result;
    if (!row) return fallback;
    const cfg = row.value as unknown as SiteConfig & {
      pages?: {
        contact?: { instagram?: string; twitter?: string; socialLinks?: SiteConfig["pages"]["contact"]["socialLinks"] };
      };
    };
    // Migrate legacy instagram/twitter fields to socialLinks
    if (cfg.pages?.contact) {
      const c = cfg.pages.contact;
      if (!c.socialLinks) {
        c.socialLinks = [];
        if ((c as { instagram?: string }).instagram) {
          c.socialLinks.push({ id: "sl_ig", platform: "Instagram", url: (c as { instagram?: string }).instagram!, label: "Follow us on Instagram" });
        }
        if ((c as { twitter?: string }).twitter) {
          c.socialLinks.push({ id: "sl_tw", platform: "Twitter / X", url: (c as { twitter?: string }).twitter!, label: "Follow us on Twitter" });
        }
      }
    }
    // Ensure every section from the local fallback exists in the DB config
    // (handles cases where a section was added to the JSON after the DB config was saved)
    if (cfg.sections) {
      const dbIds = new Set(cfg.sections.map((s: { id: string }) => s.id));
      for (const ls of fallback.sections) {
        if (!dbIds.has(ls.id)) {
          cfg.sections.push(ls);
        }
      }
      cfg.sections.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
      // Enforce: about-us must always appear after style-in-motion
      const simSection = cfg.sections.find((s: { id: string }) => s.id === "style-in-motion");
      const ausSection = cfg.sections.find((s: { id: string }) => s.id === "about-us");
      if (simSection && ausSection && ausSection.order <= simSection.order) {
        ausSection.order = simSection.order + 1;
        cfg.sections.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
      }
    } else {
      cfg.sections = fallback.sections;
    }

    // Merge sectionContent from local fallback so renamed/updated asset paths
    // in the JSON always take precedence over stale values stored in the DB.
    if (fallback.sectionContent) {
      cfg.sectionContent = {
        ...fallback.sectionContent,
        ...(cfg.sectionContent ?? {}),
        bestSellers: {
          ...fallback.sectionContent.bestSellers,
          ...(cfg.sectionContent?.bestSellers ?? {}),
          // Always use the local image paths — they are the files actually in git
          leftImage: fallback.sectionContent.bestSellers?.leftImage,
          rightImage: fallback.sectionContent.bestSellers?.rightImage,
        },
      };
    }

    return cfg as unknown as SiteConfig;
  } catch {
    return fallback;
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
  email?: string;
  phone?: string;
  loginAt: string;
  loginCount: number;
  registeredAt?: string;
};

function rowToUser(row: typeof usersTable.$inferSelect): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    loginAt: row.loginAt.toISOString(),
    loginCount: row.loginCount,
    registeredAt: row.registeredAt.toISOString(),
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  // Check cache first (30 second TTL)
  const cached = getCached("users");
  if (cached) return cached as AdminUser[];

  if (!hasDatabase) {
    setCached("users", [], 30000);
    return [];
  }

  try {
    const rows = await withTimeout(db.select().from(usersTable));
    if (!rows) {
      setCached("users", [], 30000);
      return [];
    }
    const result = rows.map(rowToUser);
    setCached("users", result, 30000); // Cache for 30 seconds
    return result;
  } catch {
    setCached("users", [], 30000);
    return [];
  }
}

export async function recordUserLogin(user: {
  id: string;
  name: string;
  email: string;
}): Promise<void> {
  const now = new Date();
  const [existing] = await db
    .select({ loginCount: usersTable.loginCount })
    .from(usersTable)
    .where(eq(usersTable.id, user.id));

  if (existing) {
    await db
      .update(usersTable)
      .set({ loginAt: now, loginCount: existing.loginCount + 1, name: user.name })
      .where(eq(usersTable.id, user.id));
  } else {
    await db.insert(usersTable).values({
      id: user.id,
      name: user.name,
      email: user.email,
      loginAt: now,
      loginCount: 1,
      registeredAt: now,
    });
  }
  
  // Invalidate cache
  dataCache.delete("users");
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type AdminOrder = {
  id: string;
  user: { name: string; phone?: string; email?: string; id?: string } | null;
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
  // Check cache first (30 second TTL for frequently changing data)
  const cached = getCached("orders");
  if (cached) return cached as AdminOrder[];

  if (!hasDatabase) {
    setCached("orders", [], 30000);
    return [];
  }

  try {
    const rows = await withTimeout(db.select().from(ordersTable));
    if (!rows) {
      setCached("orders", [], 30000);
      return [];
    }
    const result = rows.map(rowToOrder);
    setCached("orders", result, 30000); // Cache for 30 seconds
    return result;
  } catch {
    setCached("orders", [], 30000);
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
  
  // Invalidate cache
  dataCache.delete("orders");
}

export async function updateOrderStatus(
  id: string,
  status: AdminOrder["status"]
): Promise<void> {
  await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id));
  
  // Invalidate cache
  dataCache.delete("orders");
}

// ── Cart Items ────────────────────────────────────────────────────────────────

export type AdminCartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  color?: string;
  addedAt: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  productName: string;
  productPrice: number;
  productImage: string;
};

export async function getCartItems(): Promise<AdminCartItem[]> {
  // Check cache first (30 second TTL)
  const cached = getCached("cartItems");
  if (cached) return cached as AdminCartItem[];

  if (!hasDatabase) {
    setCached("cartItems", [], 30000);
    return [];
  }

  try {
    const rows = await withTimeout(
      db
        .select({
          id: userCartTable.id,
          userId: userCartTable.userId,
          productId: userCartTable.productId,
          quantity: userCartTable.quantity,
          color: userCartTable.color,
          addedAt: userCartTable.addedAt,
          customerName: usersTable.name,
          customerEmail: usersTable.email,
          customerPhone: usersTable.phone,
          productName: productsTable.name,
          productPrice: productsTable.price,
          productImage: productsTable.image,
        })
        .from(userCartTable)
        .innerJoin(usersTable, eq(userCartTable.userId, usersTable.id))
        .innerJoin(productsTable, eq(userCartTable.productId, productsTable.id))
        .orderBy(desc(userCartTable.addedAt))
    );

    if (!rows) {
      setCached("cartItems", [], 30000);
      return [];
    }

    const result = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      quantity: row.quantity,
      color: row.color ?? undefined,
      addedAt: (row.addedAt as Date).toISOString(),
      customerName: row.customerName,
      customerEmail: row.customerEmail ?? undefined,
      customerPhone: row.customerPhone ?? undefined,
      productName: row.productName,
      productPrice: row.productPrice,
      productImage: row.productImage,
    }));

    setCached("cartItems", result, 30000); // Cache for 30 seconds
    return result;
  } catch {
    setCached("cartItems", [], 30000);
    return [];
  }
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
    email?: string;
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
    { name: string; email?: string; totalSpent: number; orderCount: number }
  > = {};
  delivered.forEach((o) => {
    if (!o.user) return;
    const key = o.user.email ?? o.user.id ?? o.user.name;
    if (!customerMap[key])
      customerMap[key] = {
        name: o.user.name,
        email: o.user.email,
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

// ── Contact messages ──────────────────────────────────────────────────────────

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
};

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!hasDatabase) return [];
  try {
    const rows = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone ?? "",
      message: r.message,
      status: r.status as "new" | "read" | "replied",
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
