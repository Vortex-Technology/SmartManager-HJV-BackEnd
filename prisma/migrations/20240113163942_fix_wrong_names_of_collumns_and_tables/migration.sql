/*
  Warnings:

  - You are about to drop the column `udpated_at` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the `products_variatns_inventories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products_variatns_inventories" DROP CONSTRAINT "products_variatns_inventories_inventory_id_fkey";

-- DropForeignKey
ALTER TABLE "products_variatns_inventories" DROP CONSTRAINT "products_variatns_inventories_product_variant_id_fkey";

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "udpated_at",
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "products_variatns_inventories";

-- CreateTable
CREATE TABLE "products_variants_inventories" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "product_variant_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,

    CONSTRAINT "products_variants_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_variants_inventories_id_key" ON "products_variants_inventories"("id");

-- AddForeignKey
ALTER TABLE "products_variants_inventories" ADD CONSTRAINT "products_variants_inventories_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_variants_inventories" ADD CONSTRAINT "products_variants_inventories_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
