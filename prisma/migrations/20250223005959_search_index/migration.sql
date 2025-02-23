-- AlterTable
ALTER TABLE
  "Experiment"
ADD
  COLUMN "search" tsvector DEFAULT ''::tsvector;

-- sadly not supported by prisma
-- ALTER TABLE 
--   "Experiment"
-- ADD
--   COLUMN "search" tsvector GENERATED ALWAYS AS (to_tsvector('german', name)) STORED;


-- doesn't work either :(

-- Function to be invoked by trigger

CREATE OR REPLACE FUNCTION update_tsvector_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.search := to_tsvector('german', COALESCE(NEW.name, ' '));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY definer SET search_path = public, pg_temp;

-- Trigger that keeps the TSVECTOR up to date

DROP TRIGGER IF EXISTS "update_tsvector" ON "Movie";

CREATE TRIGGER "update_tsvector"
  BEFORE INSERT OR UPDATE ON "Experiment"
  FOR EACH ROW
  EXECUTE FUNCTION update_tsvector_column ();
