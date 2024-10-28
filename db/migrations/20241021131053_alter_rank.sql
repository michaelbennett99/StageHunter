-- migrate:up

-- Create a composite type of an int and an enum to store rank information
CREATE TYPE racedata.RANK_ENUM AS ENUM (
    'VAL', -- valid ranking
    'DNF', -- did not finish
    'DNS', -- did not start
    'OTL', -- over time limit
    'DF',  -- did finish, no result
    'NR',  -- no result
    'DSQ'  -- disqualified
);
CREATE TYPE racedata.RANK_TYPE AS (
    num INT,
    info racedata.RANK_ENUM
);

-- Alter the rank column in the results_templates.results table to use RANK_TYPE
-- no existing data so no need to update
ALTER TABLE results_templates.results
ALTER COLUMN rank TYPE racedata.RANK_TYPE USING (
    CASE
        WHEN rank::text ~ '^[0-9]+$'
            THEN ROW(rank::int, 'VAL')::racedata.RANK_TYPE
        ELSE
            ROW(NULL, rank::text::racedata.RANK_ENUM)::racedata.RANK_TYPE
    END
);

-- Add a CHECK constraint to ensure the rank column always has the info field
-- and always has the num field if the info field is VAL
ALTER TABLE results_templates.results
ADD CONSTRAINT check_rank_fields
CHECK (
    (rank).info IS NOT NULL
    AND (
        ((rank).info = 'VAL' AND (rank).num IS NOT NULL)
        OR ((rank).info != 'VAL')
    )
);

-- The changes will automatically propagate to the inheriting tables:
-- racedata.stage_classification
-- racedata.general_classification
-- racedata.points_classification
-- racedata.mountain_classification
-- racedata.young_riders_classification

-- No need to alter these tables individually as they inherit from results_templates.results

-- migrate:down

-- drop the CHECK constraint
ALTER TABLE results_templates.results
DROP CONSTRAINT check_rank_fields;

-- revert the rank column to its original type
-- no existing data so no need to update
ALTER TABLE results_templates.results
ALTER COLUMN rank TYPE INT USING (rank).num;

-- drop the RANK_TYPE type
DROP TYPE racedata.RANK_TYPE;
DROP TYPE racedata.RANK_ENUM;
