/*
  Warnings:

  - The primary key for the `Artist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the `Track` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Artist_mbid_key";

-- AlterTable
ALTER TABLE "Artist" DROP CONSTRAINT "Artist_pkey",
DROP COLUMN "id",
ADD COLUMN     "data" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Artist_pkey" PRIMARY KEY ("mbid");

-- DropTable
DROP TABLE "Track";

-- CreateTable
CREATE TABLE "Recording" (
    "mbid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "duration" INTEGER,
    "data" JSONB NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("mbid")
);

-- CreateTable
CREATE TABLE "Release" (
    "mbid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "coverArtUrl" TEXT,
    "data" JSONB NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("mbid")
);
