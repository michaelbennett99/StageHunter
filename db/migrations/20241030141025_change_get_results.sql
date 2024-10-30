-- migrate:up

DROP FUNCTION racedata.get_results(bigint, bigint);

CREATE VIEW racedata.riders_teams_results AS
SELECT
    rv.stage_id,
    rv."rank",
    CASE WHEN rv.classification != 'teams'
        THEN r.first_name || ' ' || r.last_name
        ELSE NULL
    END AS rider,
    t.name AS team,
    rv.time AS time,
    rv.points AS points,
    rv.classification AS classification
FROM racedata.results_valid rv
LEFT JOIN racedata.riders r ON rv.rider_id = r.rider_id
LEFT JOIN racedata.teams t ON rv.team_id = t.team_id;

-- migrate:down

DROP VIEW racedata.riders_teams_results;

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
        rv."rank",
        CASE WHEN rv.classification != 'teams'
            THEN r.first_name || ' ' || r.last_name
            ELSE NULL
        END AS rider,
        t.name AS team,
        rv.time AS time,
        rv.points AS points,
        rv.classification AS classification
    FROM racedata.results_valid rv
    LEFT JOIN racedata.riders r ON rv.rider_id = r.rider_id
    LEFT JOIN racedata.teams t ON rv.team_id = t.team_id
    WHERE
        rv.stage_id = p_stage_id
        AND rv."rank" <= p_top_n
    ORDER BY rv.classification, rv."rank" ASC;
$$ LANGUAGE sql;
