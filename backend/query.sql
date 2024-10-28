-- name: GetDailyStage :one
SELECT stage_id FROM racedata.daily
WHERE daily_id = (SELECT MAX(daily_id) FROM racedata.daily);

-- name: GetRandomStage :one
SELECT racedata.get_random_stage_id();

-- name: GetTrack :one
SELECT ST_AsGeoJSON(the_geom)::jsonb
FROM racedata.stages s
JOIN geog.tracks t ON s.gpx_id = t.track_id
WHERE s.stage_id = $1;

-- name: GetElevation :many
SELECT distance, ele
FROM racedata.stages_elevation
WHERE stage_id = $1;

-- name: GetStageInfo :one
SELECT
    gt,
    year,
    stage_number::int,
    stage_type,
    stage_start,
    stage_end,
    stage_length
FROM racedata.races_stages
WHERE stage_id = $1;

-- name: GetResults :many
SELECT * FROM racedata.get_results($1, $2);

-- name: GetStageResults :many
SELECT * FROM racedata.get_results($1, $2)
WHERE classification = 'stage';

-- name: GetGCResults :many
SELECT * FROM racedata.get_results($1, $2)
WHERE classification = 'general';

-- name: GetPointsResults :many
SELECT * FROM racedata.get_results($1, $2)
WHERE classification = 'points';

-- name: GetMountainsResults :many
SELECT * FROM racedata.get_results($1, $2)
WHERE classification = 'mountains';

-- name: GetYouthResults :many
SELECT * FROM racedata.get_results($1, $2)
WHERE classification = 'youth';

-- name: GetTeamsResults :many
SELECT * FROM racedata.get_results($1, $2)
WHERE classification = 'teams';
