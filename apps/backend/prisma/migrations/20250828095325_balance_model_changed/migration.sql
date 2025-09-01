/*
  Warnings:

  - A unique constraint covering the columns `[userId,assetId]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Balance_userId_idx" ON "public"."Balance"("userId");

-- CreateIndex
CREATE INDEX "Balance_assetId_idx" ON "public"."Balance"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_assetId_key" ON "public"."Balance"("userId", "assetId");
