/*
  Warnings:

  - A unique constraint covering the columns `[login]` on the table `collaborators` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "collaborators_login_role_key";

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_login_key" ON "collaborators"("login");
