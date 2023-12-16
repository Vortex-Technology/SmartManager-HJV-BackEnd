-- CreateTable
CREATE TABLE "administrator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "administrator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrator_id_key" ON "administrator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "administrator_login_key" ON "administrator"("login");
