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
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_id" varchar(20),
	"product_id" integer,
	"img_url" text NOT NULL,
	"order_index" integer,
	"is_cover" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_images_ref_id_img_url_unique" UNIQUE("ref_id","img_url")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_id" varchar(20),
	"name" varchar(225) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"stock_on_hand" integer DEFAULT 0,
	"stock_reserved" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_ref_id_unique" UNIQUE("ref_id"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "price_check" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_ref_id_products_ref_id_fk" FOREIGN KEY ("ref_id") REFERENCES "public"."products"("ref_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE cascade;