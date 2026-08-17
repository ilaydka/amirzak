/*
  SupportStatus değişikliği:

  CLOSED -> REJECTED

  Mevcut CLOSED destek kayıtları korunur
  ve REJECTED durumuna dönüştürülür.
*/

BEGIN;

CREATE TYPE "SupportStatus_new" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED'
);

ALTER TABLE "public"."support_tickets"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "public"."support_tickets"
ALTER COLUMN "status" TYPE "SupportStatus_new"
USING (
  CASE
    WHEN "status"::text = 'CLOSED'
      THEN 'REJECTED'::"SupportStatus_new"
    ELSE "status"::text::"SupportStatus_new"
  END
);

ALTER TYPE "public"."SupportStatus"
RENAME TO "SupportStatus_old";

ALTER TYPE "public"."SupportStatus_new"
RENAME TO "SupportStatus";

DROP TYPE "public"."SupportStatus_old";

ALTER TABLE "public"."support_tickets"
ALTER COLUMN "status"
SET DEFAULT 'OPEN';

COMMIT;