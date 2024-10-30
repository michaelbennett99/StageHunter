-- migrate:up

CREATE VIEW racedata.results_valid AS
    SELECT
        result_id,
        stage_id,
        ROW_NUMBER()
        OVER (PARTITION BY stage_id, classification ORDER BY (rank).num)
        AS "rank",
        classification,
        team_id,
        rider_id,
        "time",
        points
    FROM racedata.results
    WHERE (rank).info = 'VAL';

-- migrate:down

DROP VIEW racedata.results_valid;
