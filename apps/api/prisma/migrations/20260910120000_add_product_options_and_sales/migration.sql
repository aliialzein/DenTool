-- Add sale pricing without changing existing regular prices.
ALTER TABLE "products"
  ADD COLUMN "salePrice" DECIMAL(10,2),
  ADD COLUMN "isOnSale" BOOLEAN NOT NULL DEFAULT false;

-- Product-specific reusable option groups and values.
CREATE TABLE "product_option_groups" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "isRequired" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" UUID NOT NULL,
  CONSTRAINT "product_option_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_option_values" (
  "id" UUID NOT NULL,
  "label" TEXT NOT NULL,
  "priceAdjustment" DECIMAL(10,2) NOT NULL,
  "colorHex" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "groupId" UUID NOT NULL,
  CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_option_groups_productId_idx" ON "product_option_groups"("productId");
CREATE INDEX "product_option_values_groupId_idx" ON "product_option_values"("groupId");

ALTER TABLE "product_option_groups"
  ADD CONSTRAINT "product_option_groups_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_option_values"
  ADD CONSTRAINT "product_option_values_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "product_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
