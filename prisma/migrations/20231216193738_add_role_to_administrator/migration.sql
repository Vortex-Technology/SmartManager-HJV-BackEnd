-- CreateEnum
CREATE TYPE "RoleAdministrator" AS ENUM ('MASTER', 'FULL_ACCESS', 'CREATOR', 'VIEWER');

-- AlterTable
ALTER TABLE "administrator" ADD COLUMN     "role" "RoleAdministrator" NOT NULL DEFAULT 'FULL_ACCESS';
