/*
  Warnings:

  - You are about to drop the column `apiKey_id` on the `refresh_tokens_collaborators` table. All the data in the column will be lost.
  - Added the required column `api_key_id` to the `refresh_tokens_collaborators` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "refresh_tokens_collaborators" DROP CONSTRAINT "refresh_tokens_collaborators_apiKey_id_fkey";

-- AlterTable
ALTER TABLE "refresh_tokens_collaborators" DROP COLUMN "apiKey_id",
ADD COLUMN     "api_key_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "refresh_tokens_collaborators" ADD CONSTRAINT "refresh_tokens_collaborators_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
