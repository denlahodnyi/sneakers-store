CREATE TYPE "Role" AS ENUM (
  'super_admin',
  'admin'
);

CREATE TYPE "SizeSystem" AS ENUM (
  'EU',
  'US'
);

CREATE TYPE "Gender" AS ENUM (
  'men',
  'women',
  'kids'
);

CREATE TYPE "Discount_type" AS ENUM (
  'fixed',
  'percentage'
);

CREATE TYPE "Pay_status" AS ENUM (
  'pending',
  'paid',
  'canceled',
  'refund'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "email" text,
  "email_verified" timestamp,
  "name" text,
  "password" varchar(255),
  "image" text,
  "role" Role,
  "phone" varchar(20)
);

CREATE TABLE "sessions" (
  "session_token" text PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "expires" timestamp
);

CREATE TABLE "categories" (
  "id" int PRIMARY KEY,
  "parent_id" int,
  "name" varchar(50) NOT NULL,
  "is_active" bool NOT NULL DEFAULT true
);

CREATE TABLE "brands" (
  "id" int PRIMARY KEY,
  "name" varchar(50) UNIQUE NOT NULL,
  "icon_url" varchar(250),
  "is_active" bool DEFAULT true
);

CREATE TABLE "colors" (
  "id" int PRIMARY KEY,
  "name" varchar(50) NOT NULL,
  "hex" varchar(7) NOT NULL,
  "is_active" bool DEFAULT true
);

CREATE TABLE "sizes" (
  "id" int PRIMARY KEY,
  "size" smallint NOT NULL,
  "system" SizeSystem,
  "is_active" bool DEFAULT true
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY,
  "brand_id" int NOT NULL,
  "category_id" int NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" varchar(255),
  "gender" Gender NOT NULL,
  "is_active" bool DEFAULT false,
  "is_featured" bool DEFAULT false,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "product_variants" (
  "id" uuid PRIMARY KEY,
  "product_id" uuid NOT NULL,
  "color_id" int NOT NULL,
  "name" varchar(255) UNIQUE,
  "slug" varchar(255) UNIQUE
);

CREATE TABLE "product_skus" (
  "id" uuid PRIMARY KEY,
  "product_id" uuid NOT NULL,
  "product_variant_id" uuid NOT NULL,
  "sku" varchar(50) UNIQUE NOT NULL,
  "stock_qty" int DEFAULT 0,
  "base_price" int DEFAULT 0,
  "size_id" int,
  "is_active" bool DEFAULT true,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "product_images" (
  "id" uuid PRIMARY KEY,
  "public_id" text UNIQUE NOT NULL,
  "product_variant_id" uuid NOT NULL,
  "url" text NOT NULL,
  "alt" text DEFAULT '',
  "width" int,
  "height" int,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "discounts" (
  "id" int PRIMARY KEY,
  "product_variant_id" uuid NOT NULL,
  "discount_type" Discount_type NOT NULL,
  "discount_value" int NOT NULL,
  "is_active" bool DEFAULT true,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "favourite_products" (
  "id" uuid PRIMARY KEY,
  "product_variant_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL
);

CREATE TABLE "carts" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "cart_items" (
  "id" uuid PRIMARY KEY,
  "cart_id" uuid NOT NULL,
  "product_sku_id" uuid NOT NULL,
  "qty" int NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "price_in_cents" int NOT NULL,
  "total_price_in_cents" int NOT NULL,
  "total_discount_in_cents" int,
  "pay_status" Pay_status NOT NULL DEFAULT 'pending',
  "customer_name" text,
  "email" text,
  "phone" varchar(20),
  "address" json,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp
);

CREATE TABLE "order_lines" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid NOT NULL,
  "product_sku_id" uuid NOT NULL,
  "price_in_cents" int NOT NULL,
  "final_price_in_cents" int NOT NULL,
  "discount_type" Discount_type,
  "discount_value" int,
  "qty" int NOT NULL
);

ALTER TABLE "sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");

ALTER TABLE "products" ADD FOREIGN KEY ("brand_id") REFERENCES "brands" ("id");

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "product_variants" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "product_variants" ADD FOREIGN KEY ("color_id") REFERENCES "colors" ("id");

ALTER TABLE "product_skus" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "product_skus" ADD FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id");

ALTER TABLE "product_skus" ADD FOREIGN KEY ("size_id") REFERENCES "sizes" ("id");

ALTER TABLE "product_images" ADD FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id");

ALTER TABLE "discounts" ADD FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id");

ALTER TABLE "favourite_products" ADD FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id");

ALTER TABLE "favourite_products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "carts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "cart_items" ADD FOREIGN KEY ("cart_id") REFERENCES "carts" ("id");

ALTER TABLE "cart_items" ADD FOREIGN KEY ("product_sku_id") REFERENCES "product_skus" ("id");

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "order_lines" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

ALTER TABLE "order_lines" ADD FOREIGN KEY ("product_sku_id") REFERENCES "product_skus" ("id");
