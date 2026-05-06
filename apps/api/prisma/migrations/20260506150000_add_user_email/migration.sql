ALTER TABLE "User" ADD COLUMN "email" TEXT;

UPDATE "User" SET "email" = LOWER("loginId") || '@seed.local' WHERE "email" IS NULL;

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
