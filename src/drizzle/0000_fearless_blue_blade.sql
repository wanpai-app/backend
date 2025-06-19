CREATE TYPE "public"."notification_type" AS ENUM('order_created', 'order_shipped', 'order_delivered', 'account');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('paid', 'cancelled', 'refunded', 'shipped', 'delivered', 'returned');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."stock_reason" AS ENUM('stock_in', 'stock_out', 'adjustment', 'initial', 'return');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price_at_add" numeric(8) NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"soft_del" boolean DEFAULT false NOT NULL,
	CONSTRAINT "quantity_check" CHECK ("cart_items"."quantity" > 0),
	CONSTRAINT "unit_price_check" CHECK ("cart_items"."price_at_add" >= 0)
);
--> statement-breakpoint
CREATE TABLE "ecpay_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_trade_no" varchar(50) NOT NULL,
	"ecpay_trade_no" varchar(20),
	"merchant_trade_date" varchar(20) NOT NULL,
	"total_amount" numeric NOT NULL,
	"trade_desc" varchar(200),
	"item_name" varchar(200),
	"payment_type" varchar(20),
	"trade_status" varchar(50) DEFAULT 'pending',
	"rtn_code" integer,
	"rtn_msg" text,
	"payment_date" varchar(20),
	"simulate_paid" integer,
	"check_mac_value" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "favorites_user_id_product_id_unique" UNIQUE("user_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" varchar(255) NOT NULL,
	"order_id" integer,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(255) NOT NULL,
	"user_id" integer,
	"recipient_name" varchar(100) NOT NULL,
	"recipient_phone" varchar(20) NOT NULL,
	"shipping_address" varchar(255) NOT NULL,
	"total_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" "order_status" DEFAULT 'paid' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_id" varchar(20),
	"product_id" integer,
	"img_url" text NOT NULL,
	"order_index" integer,
	"is_cover" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_ref_img" UNIQUE("ref_id","img_url")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_id" varchar(20),
	"name" varchar(225) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"stock_on_hand" integer DEFAULT 0,
	"stock_reserved" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "products_ref_id_unique" UNIQUE("ref_id"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "price_check" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"amount_before" integer NOT NULL,
	"amount_after" integer NOT NULL,
	"amount_change" integer NOT NULL,
	"reason" "stock_reason" DEFAULT 'adjustment',
	"role" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_ref_id_products_ref_id_fk" FOREIGN KEY ("ref_id") REFERENCES "public"."products"("ref_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;