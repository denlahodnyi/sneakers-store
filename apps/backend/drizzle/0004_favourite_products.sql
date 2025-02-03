CREATE TABLE IF NOT EXISTS "favourite_products" (
	"id" text PRIMARY KEY NOT NULL,
	"product_var_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favourite_products" ADD CONSTRAINT "favourite_products_product_var_id_product_variants_id_fk" FOREIGN KEY ("product_var_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favourite_products" ADD CONSTRAINT "favourite_products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
