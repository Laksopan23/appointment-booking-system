/*
  Warnings:

  - You are about to drop the column `date` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId,startAt]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endAt` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_providerId_date_time_idx";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "IdCounter" (
    "prefix" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IdCounter_pkey" PRIMARY KEY ("prefix")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" "Role" NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorRole_idx" ON "AuditLog"("actorRole");

-- CreateIndex
CREATE INDEX "Availability_providerId_startAt_idx" ON "Availability"("providerId", "startAt");

-- CreateIndex
CREATE INDEX "Booking_providerId_startAt_idx" ON "Booking"("providerId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_providerId_startAt_key" ON "Booking"("providerId", "startAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
