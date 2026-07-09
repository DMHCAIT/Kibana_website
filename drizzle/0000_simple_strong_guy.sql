CREATE TABLE IF NOT EXISTS "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 999 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '',
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"bucket" text NOT NULL,
	"path" text NOT NULL,
	"type" text DEFAULT 'image' NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user" jsonb,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"shipping_address" text,
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"tracking_id" text,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp_sessions" (
	"phone" text PRIMARY KEY NOT NULL,
	"two_factor_session_id" text,
	"otp" text,
	"dev_otp" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"compare_at_price" integer,
	"image" text DEFAULT '' NOT NULL,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"gender" text DEFAULT 'women' NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"is_best_seller" boolean DEFAULT false NOT NULL,
	"is_trending" boolean DEFAULT false NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"color_variants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"video" text DEFAULT '',
	"rating" real DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 999 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_cart" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"color" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_wishlist" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text,
	"phone" text,
	"login_at" timestamp with time zone DEFAULT now() NOT NULL,
	"login_count" integer DEFAULT 1 NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL
);
