/*
  Warnings:

  - You are about to drop the column `owner_id` on the `companies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id]` on the table `collaborators` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `founder_id` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_owner_id_fkey";

-- AlterTable
ALTER TABLE "collaborators" ADD COLUMN     "company_id" TEXT,
ALTER COLUMN "market_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "owner_id",
ADD COLUMN     "founder_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_company_id_key" ON "collaborators"("company_id");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
