-- AlterTable
ALTER TABLE "ClassGroup" ADD COLUMN     "attendanceEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attendanceEndsAt" TIMESTAMP(3);
