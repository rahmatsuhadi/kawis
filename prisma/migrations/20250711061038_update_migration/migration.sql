/*
  Warnings:

  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `event_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_post_images` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "event_images" DROP CONSTRAINT "event_images_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_post_images" DROP CONSTRAINT "event_post_images_eventPostId_fkey";

-- DropIndex
DROP INDEX "users_fullName_key";

-- AlterTable
ALTER TABLE "event_posts" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullName",
ADD COLUMN     "name" VARCHAR(255);

-- DropTable
DROP TABLE "event_images";

-- DropTable
DROP TABLE "event_post_images";

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");
