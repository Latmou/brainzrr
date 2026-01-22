-- DropForeignKey
ALTER TABLE "Recording" DROP CONSTRAINT "Recording_releaseId_fkey";

-- AlterTable
ALTER TABLE "Release" RENAME COLUMN "mbid" TO "id";
ALTER TABLE "Release" DROP CONSTRAINT "Release_pkey";
ALTER TABLE "Release" ADD CONSTRAINT "Release_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;
