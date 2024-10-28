-- migrate:up

CREATE OR REPLACE FUNCTION racedata.get_results(
    p_stage_id bigint,
    p_top_n bigint
)
RETURNS TABLE (
    rank bigint,
    rider text,
    team text,
    "time" interval,
    points integer,
    classification racedata.classification_type
)
STABLE
PARALLEL SAFE
AS $$
    SELECT
        c.rn AS rank,
        CASE WHEN c.classification != 'teams'
            THEN r.first_name || ' ' || r.last_name
            ELSE NULL
        END AS rider,
        t.name AS team,
        c.time AS time,
        c.points AS points,
        c.classification AS classification
    FROM racedata.classifications_valid c
    LEFT JOIN racedata.riders r ON c.rider_id = r.rider_id
    LEFT JOIN racedata.teams t ON c.team_id = t.team_id
    WHERE
        c.stage_id = p_stage_id
        AND c.rn <= p_top_n
    ORDER BY c.classification, c.rn ASC;
$$ LANGUAGE sql;

-- migrate:down

DROP FUNCTION racedata.get_results(bigint, bigint);
