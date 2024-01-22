/*
  Warnings:

  - A unique constraint covering the columns `[inventory_id]` on the table `markets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventory_id` to the `markets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "inventory_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "markets_inventory_id_key" ON "markets"("inventory_id");

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
