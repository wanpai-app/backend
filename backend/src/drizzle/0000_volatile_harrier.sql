CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"img" varchar,
	"price" integer NOT NULL,
	"status" char,
	"created_at" timestamp,
	"updated_at" timestamp
);
