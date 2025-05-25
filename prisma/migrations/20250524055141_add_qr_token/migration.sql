-- CreateTable
CREATE TABLE "QrToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);
