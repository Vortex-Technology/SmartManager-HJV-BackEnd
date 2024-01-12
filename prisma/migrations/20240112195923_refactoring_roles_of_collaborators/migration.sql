/*
  Warnings:

  - The values [FULL_ACCESS,EDITOR,VIEWER] on the enum `RoleCollaborator` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `collaborators` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login,role]` on the table `collaborators` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleCollaborator_new" AS ENUM ('MASTER', 'OWNER', 'MANAGER', 'STOCKIST', 'SELLER');
ALTER TABLE "collaborators" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "collaborators" ALTER COLUMN "role" TYPE "RoleCollaborator_new" USING ("role"::text::"RoleCollaborator_new");
ALTER TYPE "RoleCollaborator" RENAME TO "RoleCollaborator_old";
ALTER TYPE "RoleCollaborator_new" RENAME TO "RoleCollaborator";
DROP TYPE "RoleCollaborator_old";
ALTER TABLE "collaborators" ALTER COLUMN "role" SET DEFAULT 'SELLER';
COMMIT;

-- DropIndex
DROP INDEX "collaborators_login_key";

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "type",
ALTER COLUMN "role" SET DEFAULT 'SELLER';

-- DropEnum
DROP TYPE "CollaboratorType";

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_login_role_key" ON "collaborators"("login", "role");
