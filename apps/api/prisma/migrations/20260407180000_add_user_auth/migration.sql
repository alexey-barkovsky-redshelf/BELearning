CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
