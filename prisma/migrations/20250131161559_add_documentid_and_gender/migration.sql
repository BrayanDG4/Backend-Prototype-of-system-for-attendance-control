/*
  Warnings:

  - A unique constraint covering the columns `[documentId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "documentId" TEXT,
ADD COLUMN     "gender" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_documentId_key" ON "User"("documentId");
