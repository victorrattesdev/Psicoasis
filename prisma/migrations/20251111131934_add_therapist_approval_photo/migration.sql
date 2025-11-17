-- AlterTable
ALTER TABLE "therapists" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photoUrl" TEXT;
