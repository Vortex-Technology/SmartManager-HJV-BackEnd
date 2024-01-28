-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM(
    'CREDIT_CARD', 'DEBIT_CARD', 'CASH'
);

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM(
    'PENDING', 'PAYED', 'REFUSED', 'REFUNDED'
);

-- CreateTable
CREATE TABLE "orders_products_variants" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,


CONSTRAINT "orders_products_variants_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "orders_payments" (
    "id" SERIAL NOT NULL,
    "method" "OrderPaymentMethod" NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "status" "OrderPaymentStatus" NOT NULL,


CONSTRAINT "orders_payments_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "protocol" BIGINT NOT NULL,
    "sub_total" INTEGER NOT NULL,
    "discount" INTEGER,
    "total" INTEGER NOT NULL,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "opened_by_collaborator_id" TEXT NOT NULL,
    "closed_by_collaborator_id" TEXT,
    "market_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "orderPaymentId" INTEGER,


CONSTRAINT "orders_pkey" PRIMARY KEY ("id") );

-- CreateIndex
CREATE UNIQUE INDEX "orders_products_variants_id_key" ON "orders_products_variants" ("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_payments_id_key" ON "orders_payments" ("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "orders" ("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_protocol_key" ON "orders" ("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderPaymentId_key" ON "orders" ("orderPaymentId");

-- AddForeignKey
ALTER TABLE "orders_products_variants"
ADD CONSTRAINT "orders_products_variants_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders_products_variants"
ADD CONSTRAINT "orders_products_variants_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders"
ADD CONSTRAINT "orders_opened_by_collaborator_id_fkey" FOREIGN KEY ("opened_by_collaborator_id") REFERENCES "collaborators" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders"
ADD CONSTRAINT "orders_closed_by_collaborator_id_fkey" FOREIGN KEY ("closed_by_collaborator_id") REFERENCES "collaborators" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders"
ADD CONSTRAINT "orders_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders"
ADD CONSTRAINT "orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders"
ADD CONSTRAINT "orders_orderPaymentId_fkey" FOREIGN KEY ("orderPaymentId") REFERENCES "orders_payments" ("id") ON DELETE SET NULL ON UPDATE CASCADE;