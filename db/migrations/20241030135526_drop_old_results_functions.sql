-- migrate:up

DROP FUNCTION racedata.create_good_results_view(text);
DROP FUNCTION racedata.drop_good_results_view(text);

-- migrate:down

CREATE FUNCTION racedata.create_good_results_view(
    table_name text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    view_name text;
BEGIN
    -- TODO: check if table exists in racedata schema
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename = table_name AND schemaname = 'racedata'
    ) THEN
        RAISE EXCEPTION 'Table % does not exist in racedata schema', table_name;
    END IF;

    SELECT table_name || '_valid' INTO view_name;

    EXECUTE format('
        CREATE VIEW racedata.%I AS
            SELECT
                *,
                ROW_NUMBER()
                OVER (PARTITION BY stage_id ORDER BY (rank).num) AS rn
            FROM racedata.%I
            WHERE (rank).info = ''VAL'';
    ', view_name, table_name);
END;
$$;

CREATE FUNCTION racedata.drop_good_results_view(
    table_name text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    view_name text;
BEGIN
    SELECT table_name || '_valid' INTO view_name;
    EXECUTE format('DROP VIEW IF EXISTS racedata.%I', view_name);
END;
$$;
