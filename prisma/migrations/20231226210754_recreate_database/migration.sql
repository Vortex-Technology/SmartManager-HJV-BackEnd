-- CreateEnum
CREATE TYPE "RoleCollaborator" AS ENUM (
    'MASTER',
    'FULL_ACCESS',
    'EDITOR',
    'VIEWER'
);

-- CreateEnum
CREATE TYPE "CollaboratorType" AS ENUM (
    'ADMINISTRATOR',
    'SELLER',
    'ATTENDANT'
);

-- CreateTable
CREATE TABLE
    "refresh_tokens" (
        "id" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires_in" TIMESTAMP(3) NOT NULL,
        "expired_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "collaborator_id" TEXT,

CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE
    "collaborators" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "image" TEXT,
        "login" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "type" "CollaboratorType" NOT NULL DEFAULT 'ATTENDANT',
        "role" "RoleCollaborator" NOT NULL DEFAULT 'EDITOR',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "udpated_at" TIMESTAMP(3),

CONSTRAINT "collaborators_pkey" PRIMARY KEY ("id") );

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_id_key" ON "refresh_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_id_key" ON "collaborators"("id");

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_login_key" ON "collaborators"("login");

-- AddForeignKey
ALTER TABLE "refresh_tokens"
ADD
    CONSTRAINT "refresh_tokens_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE
SET NULL ON UPDATE CASCADE;