-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "price" TEXT NOT NULL DEFAULT 'Free',
ADD COLUMN     "tags" TEXT[];
