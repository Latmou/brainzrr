-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("mbid") ON DELETE SET NULL ON UPDATE CASCADE;
