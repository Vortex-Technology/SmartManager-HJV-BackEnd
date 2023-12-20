-- AlterTable
ALTER TABLE "administrator" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "udpated_at" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'VIEWER';

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_in" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administrator_id" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_id_key" ON "refresh_tokens"("id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "administrator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
