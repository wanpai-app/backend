ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "current_stock" integer;