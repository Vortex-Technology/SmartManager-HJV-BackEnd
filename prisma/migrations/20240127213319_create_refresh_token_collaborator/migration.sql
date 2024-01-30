-- CreateTable
CREATE TABLE "refresh_tokens_collaborators" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_in" TIMESTAMP(3) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "apiKey_id" TEXT NOT NULL,
    "collaborator_id" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_collaborators_id_key" ON "refresh_tokens_collaborators"("id");

-- AddForeignKey
ALTER TABLE "refresh_tokens_collaborators" ADD CONSTRAINT "refresh_tokens_collaborators_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens_collaborators" ADD CONSTRAINT "refresh_tokens_collaborators_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens_collaborators" ADD CONSTRAINT "refresh_tokens_collaborators_apiKey_id_fkey" FOREIGN KEY ("apiKey_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens_collaborators" ADD CONSTRAINT "refresh_tokens_collaborators_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
