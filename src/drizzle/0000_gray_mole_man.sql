CREATE TABLE "orders" (
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
	"user_id" integer,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"order_id" text,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"img" varchar,
	"price" integer NOT NULL,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"current_stock" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;