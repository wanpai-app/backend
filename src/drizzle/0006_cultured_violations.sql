CREATE TYPE "public"."notification_type" AS ENUM('order_created', 'order_shipped', 'order_delivered', 'account');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('paid', 'cancelled', 'refunded', 'shipped', 'delivered', 'returned');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."stock_reason" AS ENUM('stock_in', 'stock_out', 'adjustment', 'initial', 'return');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
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
ALTER TABLE "products" ALTER COLUMN "name" SET DATA TYPE varchar(225);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."status";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_number" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "recipient_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "recipient_phone" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "quantity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status" "order_status" DEFAULT 'paid' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ref_id" varchar(20);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock_on_hand" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock_reserved" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_ref_id_products_ref_id_fk" FOREIGN KEY ("ref_id") REFERENCES "public"."products"("ref_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "merchant_trade_no";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "ecpay_trade_no";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "merchant_trade_date";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "trade_desc";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "item_name";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "payment_type";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "trade_status";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "rtn_code";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "rtn_msg";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "payment_date";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "simulate_paid";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "check_mac_value";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "img";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "current_stock";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_ref_id_unique" UNIQUE("ref_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "price_check" CHECK ("products"."price" >= 0);