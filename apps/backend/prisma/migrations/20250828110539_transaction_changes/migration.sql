/*
  Warnings:

  - You are about to drop the column `openDeciaml` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currentDeciaml` on the `Position` table. All the data in the column will be lost.
  - Added the required column `openDecimal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "openDeciaml",
ADD COLUMN     "openDecimal" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Position" DROP COLUMN "currentDeciaml",
ADD COLUMN     "currentDecimal" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "orderId" INTEGER,
ADD COLUMN     "positionId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
