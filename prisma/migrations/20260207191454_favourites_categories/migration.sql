-- AlterTable
CREATE SEQUENCE favorite_numberforsequence_seq;
ALTER TABLE "Favorite" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT,
ALTER COLUMN "numberForSequence" SET DEFAULT nextval('favorite_numberforsequence_seq');
ALTER SEQUENCE favorite_numberforsequence_seq OWNED BY "Favorite"."numberForSequence";
