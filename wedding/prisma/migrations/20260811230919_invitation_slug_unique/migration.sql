-- DropIndex
DROP INDEX "Invitation_userId_slug_key";

-- CreateTable
CREATE TABLE "InvitationAlias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvitationAlias_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationAlias_slug_key" ON "InvitationAlias"("slug");

-- CreateIndex
CREATE INDEX "InvitationAlias_invitationId_idx" ON "InvitationAlias"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_slug_key" ON "Invitation"("slug");
