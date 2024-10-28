-- migrate:up

COPY racedata.stage_classification (
    result_id, stage_id, rank, rider_id, team_id, time
)
FROM '/data/stage_results.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.general_classification (
    result_id, stage_id, rank, rider_id, team_id, time
)
FROM '/data/gc_results.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.points_classification (
    result_id, stage_id, rank, rider_id, team_id, points
)
FROM '/data/points_results.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.mountain_classification (
    result_id, stage_id, rank, rider_id, team_id, points
)
FROM '/data/mountains_results.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.young_riders_classification (
    result_id, stage_id, rank, rider_id, team_id, time
)
FROM '/data/young_rider_results.csv'
WITH (FORMAT CSV, HEADER TRUE);

COPY racedata.teams_classification (
    result_id, stage_id, team_id, rank, time
)
FROM '/data/teams_results.csv'
WITH (FORMAT CSV, HEADER TRUE);

-- migrate:down

DELETE FROM racedata.teams_classification;
DELETE FROM racedata.young_riders_classification;
DELETE FROM racedata.mountain_classification;
DELETE FROM racedata.points_classification;
DELETE FROM racedata.general_classification;
DELETE FROM racedata.stage_classification;
