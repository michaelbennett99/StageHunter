-- migrate:up

-- Create the new unified classifications table from the view
CREATE TABLE racedata.results (
    result_id SERIAL PRIMARY KEY,
    stage_id INTEGER NOT NULL REFERENCES racedata.stages(stage_id),
    "rank" racedata.rank_type NOT NULL,
    classification racedata.classification_type NOT NULL,
    team_id INTEGER NOT NULL REFERENCES racedata.teams(team_id),
    rider_id INTEGER REFERENCES racedata.riders(rider_id),
    "time" INTERVAL,
    points INTEGER
);

ALTER TABLE racedata.results ADD CONSTRAINT not_both_time_and_points_non_null CHECK (
    "time" IS NULL OR points IS NULL
);

INSERT INTO racedata.results (
    stage_id,
    "rank",
    classification,
    team_id,
    rider_id,
    "time",
    points
)
SELECT
    stage_id,
    "rank",
    'stage'::racedata.classification_type AS classification,
    team_id,
    rider_id,
    "time",
    NULL::INTEGER AS points
FROM racedata.stage_classification
UNION ALL
SELECT
    stage_id,
    "rank",
    'general'::racedata.classification_type AS classification,
    team_id,
    rider_id,
    "time",
    NULL::INTEGER AS points
FROM racedata.general_classification
UNION ALL
SELECT
    stage_id,
    "rank",
    'points'::racedata.classification_type AS classification,
    team_id,
    rider_id,
    NULL::INTERVAL AS "time",
    points
FROM racedata.points_classification
UNION ALL
SELECT
    stage_id,
    "rank",
    'mountains'::racedata.classification_type AS classification,
    team_id,
    rider_id,
    NULL::INTERVAL AS "time",
    points
FROM racedata.mountain_classification
UNION ALL
SELECT
    stage_id,
    "rank",
    'youth'::racedata.classification_type AS classification,
    team_id,
    rider_id,
    "time",
    NULL::INTEGER AS points
FROM racedata.young_riders_classification
UNION ALL
SELECT
    stage_id,
    "rank",
    'teams'::racedata.classification_type AS classification,
    team_id,
    NULL::INTEGER AS rider_id,
    "time",
    NULL::INTEGER AS points
FROM racedata.teams_classification;

-- Index the new table on the stage_id, and classification columns
CREATE INDEX ON racedata.results (stage_id, classification);

-- migrate:down

DROP TABLE racedata.results;
