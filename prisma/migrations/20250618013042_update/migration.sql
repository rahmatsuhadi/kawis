/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `event_posts` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `event_posts` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fullName]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postedByName` to the `event_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ANONYMOUS';

-- DropForeignKey
ALTER TABLE "event_posts" DROP CONSTRAINT "event_posts_userId_fkey";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "event_posts" DROP COLUMN "imageUrl",
DROP COLUMN "userId",
ADD COLUMN     "postedByName" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
ADD COLUMN     "fullName" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_fullName_key" ON "users"("fullName");
