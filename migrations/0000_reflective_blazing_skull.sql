CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.959Z' NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "agent_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"agent_user_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_at" text DEFAULT now() NOT NULL,
	"closed_at" text,
	"created_at" text DEFAULT now() NOT NULL,
	"updated_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selected_color" text,
	"variation_id" integer
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"media_url" text,
	"external_message_id" text,
	"created_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel" text NOT NULL,
	"external_user_id" text NOT NULL,
	"mode" text DEFAULT 'bot' NOT NULL,
	"last_activity_at" text DEFAULT now() NOT NULL,
	"created_at" text DEFAULT now() NOT NULL,
	"updated_at" text DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.958Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" text DEFAULT '2025-09-16T18:50:39.961Z' NOT NULL,
	"unsubscribed_at" text,
	"source" text DEFAULT 'website',
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"code" text,
	"min_order_value" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"valid_from" text NOT NULL,
	"valid_until" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"applicable_products" text[],
	"image_url" text,
	"created_at" text DEFAULT '2025-09-16T18:50:39.960Z' NOT NULL,
	"updated_at" text DEFAULT '2025-09-16T18:50:39.960Z' NOT NULL,
	CONSTRAINT "offers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "order_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_phone" text,
	"shipping_address" text NOT NULL,
	"order_items" jsonb NOT NULL,
	"subtotal_amount" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2),
	"shipping_method" text,
	"tracking_number" text,
	"shipping_label_url" text,
	"shipped_at" text,
	"estimated_delivery" text,
	"gift_message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.959Z' NOT NULL,
	"updated_at" text DEFAULT '2025-09-16T18:50:39.959Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"shipping_address" text NOT NULL,
	"subtotal_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2),
	"shipping_method" text,
	"tracking_number" text,
	"shipping_label_url" text,
	"shipped_at" text,
	"estimated_delivery" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"order_items" jsonb NOT NULL,
	"payment_id" text,
	"payment_status" text,
	"payment_method" text DEFAULT 'clover',
	"created_at" text DEFAULT '2025-09-16T18:50:39.959Z' NOT NULL,
	"updated_at" text DEFAULT '2025-09-16T18:50:39.959Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.956Z' NOT NULL,
	CONSTRAINT "product_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"color_name" text NOT NULL,
	"color_code" text,
	"image_url" text NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.958Z' NOT NULL,
	"updated_at" text DEFAULT '2025-09-16T18:50:39.958Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category_id" integer,
	"category" text NOT NULL,
	"image_url" text NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stem_count" integer,
	"in_stock" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text,
	"name" text NOT NULL,
	"recipient_name" text NOT NULL,
	"phone" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"delivery_instructions" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.961Z' NOT NULL,
	"updated_at" text DEFAULT '2025-09-16T18:50:39.961Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" text,
	"created_at" text DEFAULT '2025-09-16T18:50:39.955Z' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" text DEFAULT '2025-09-16T18:50:39.958Z' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_agent_user_id_admin_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variation_id_product_variations_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."product_variations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shipments" ADD CONSTRAINT "order_shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_addresses" ADD CONSTRAINT "saved_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_active_assignment" ON "agent_assignments" USING btree ("session_id") WHERE "agent_assignments"."status" IN ('pending', 'active');--> statement-breakpoint
CREATE INDEX "ix_agent_assignments_agent" ON "agent_assignments" USING btree ("agent_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_msg_external_id" ON "chat_messages" USING btree ("session_id","external_message_id") WHERE "chat_messages"."external_message_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "ix_chat_messages_session" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_session_channel_user" ON "chat_sessions" USING btree ("channel","external_user_id");--> statement-breakpoint
CREATE INDEX "ix_chat_sessions_mode" ON "chat_sessions" USING btree ("mode");--> statement-breakpoint
CREATE UNIQUE INDEX "session_product_unique" ON "wishlist_items" USING btree ("session_id","product_id");