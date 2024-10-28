-- migrate:up

CREATE FUNCTION racedata.get_random_stage_id()
RETURNS bigint
STABLE
PARALLEL SAFE
AS $$
    SELECT
        (random() * (max_id - min_id) + min_id)::bigint AS stage_id
    FROM (
        SELECT
            MIN(stage_id) AS min_id,
            MAX(stage_id) AS max_id
        FROM racedata.stages
    ) subquery;
$$ LANGUAGE sql;

-- migrate:down

DROP FUNCTION racedata.get_random_stage_id();
