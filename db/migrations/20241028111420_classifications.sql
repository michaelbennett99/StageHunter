-- migrate:up

-- Create one big table with all classifications as a view

CREATE TYPE racedata.classification_type AS ENUM (
    'stage',
    'general',
    'points',
    'mountains',
    'youth',
    'teams'
);

CREATE VIEW racedata.classifications_valid AS
    SELECT
        stage_id,
        rn,
        rider_id,
        team_id,
        time,
        NULL::integer AS points,
        'stage'::racedata.classification_type AS classification
    FROM racedata.stage_classification_valid
    UNION ALL
    SELECT
        stage_id,
        rn,
        rider_id,
        team_id,
        time,
        NULL::integer AS points,
        'general'::racedata.classification_type AS classification
    FROM racedata.general_classification_valid
    UNION ALL
    SELECT
        stage_id,
        rn,
        rider_id,
        team_id,
        NULL AS time,
        points,
        'points'::racedata.classification_type AS classification
    FROM racedata.points_classification_valid
    UNION ALL
    SELECT
        stage_id,
        rn,
        rider_id,
        team_id,
        NULL AS time,
        points,
        'mountains'::racedata.classification_type AS classification
    FROM racedata.mountain_classification_valid
    UNION ALL
    SELECT
        stage_id,
        rn,
        rider_id,
        team_id,
        time,
        NULL AS points,
        'youth'::racedata.classification_type AS classification
    FROM racedata.young_riders_classification_valid
    UNION ALL
    SELECT
        stage_id,
        rn,
        NULL AS rider_id,
        team_id,
        time,
        NULL AS points,
        'teams'::racedata.classification_type AS classification
    FROM racedata.teams_classification_valid;

-- migrate:down

DROP VIEW racedata.classifications_valid;

DROP TYPE racedata.classification_type;
