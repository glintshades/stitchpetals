CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"cover_image_url" text,
	"keywords" text,
	"tags" text,
	"meta_title" text,
	"meta_description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_name" text DEFAULT 'GlintShades' NOT NULL,
	"created_at" text DEFAULT now() NOT NULL,
	"updated_at" text DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"referrer" text,
	"traffic_source" text DEFAULT 'direct' NOT NULL,
	"country" text,
	"city" text,
	"session_id" text,
	"user_agent" text,
	"created_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" text DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.938Z';--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.934Z';--> statement-breakpoint
ALTER TABLE "newsletter_subscriptions" ALTER COLUMN "subscribed_at" SET DEFAULT '2026-03-13T15:00:33.939Z';--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.938Z';--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "updated_at" SET DEFAULT '2026-03-13T15:00:33.938Z';--> statement-breakpoint
ALTER TABLE "order_shipments" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.938Z';--> statement-breakpoint
ALTER TABLE "order_shipments" ALTER COLUMN "updated_at" SET DEFAULT '2026-03-13T15:00:33.938Z';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.934Z';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET DEFAULT '2026-03-13T15:00:33.934Z';--> statement-breakpoint
ALTER TABLE "product_categories" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.932Z';--> statement-breakpoint
ALTER TABLE "product_variations" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.933Z';--> statement-breakpoint
ALTER TABLE "product_variations" ALTER COLUMN "updated_at" SET DEFAULT '2026-03-13T15:00:33.933Z';--> statement-breakpoint
ALTER TABLE "saved_addresses" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.939Z';--> statement-breakpoint
ALTER TABLE "saved_addresses" ALTER COLUMN "updated_at" SET DEFAULT '2026-03-13T15:00:33.939Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.930Z';--> statement-breakpoint
ALTER TABLE "wishlist_items" ALTER COLUMN "created_at" SET DEFAULT '2026-03-13T15:00:33.933Z';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");