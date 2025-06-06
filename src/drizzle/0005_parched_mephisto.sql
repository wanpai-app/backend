ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';