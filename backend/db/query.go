package db

import (
	"context"

	"github.com/jackc/pgx/v5"

	"github.com/michaelbennett99/stagehunter/backend/lib"
)

const getDailyStageQuery = `
SELECT stage_id, date FROM racedata.daily
WHERE daily_id = (SELECT MAX(daily_id) FROM racedata.daily)
LIMIT 1;
`

const addDailyStageQuery = `
INSERT INTO racedata.daily (stage_id)
SELECT racedata.get_random_stage_id();
`

func (q *Queries) GetDailyStage(ctx context.Context) (DailyStage, error) {
	rows, err := q.conn.Query(ctx, getDailyStageQuery)
	if err != nil {
		return DailyStage{}, err
	}
	defer rows.Close()

	rowValues, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[DailyStage])
	if err != nil {
		return DailyStage{}, err
	}
	dateValue, err := rowValues.Date.DateValue()
	if err != nil {
		return DailyStage{}, err
	}
	if !lib.IsToday(dateValue.Time) {
		if _, err := q.conn.Exec(ctx, addDailyStageQuery); err != nil {
			return DailyStage{}, err
		}
		return q.GetDailyStage(ctx)
	}
	return rowValues, nil
}

const getRandomStageQuery = `
SELECT racedata.get_random_stage_id();
`

func (q *Queries) GetRandomStage(ctx context.Context) (int, error) {
	rows, err := q.conn.Query(ctx, getRandomStageQuery)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	id, err := pgx.CollectOneRow(rows, pgx.RowTo[int])
	if err != nil {
		return 0, err
	}
	return id, nil
}

const getStagesQuery = `
SELECT stage_id FROM racedata.stages;
`

func (q *Queries) GetAllStages(ctx context.Context) ([]int, error) {
	rows, err := q.conn.Query(ctx, getStagesQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stages, err := pgx.CollectRows(rows, pgx.RowTo[int])
	if err != nil {
		return nil, err
	}
	return stages, nil
}

const getStageInfoQuery = `
SELECT
	gt as grand_tour,
	year,
	stage_number,
	stage_type,
	stage_start,
	stage_end,
	stage_length
FROM racedata.races_stages
WHERE stage_id = $1
LIMIT 1;
`

// Get descriptive information about a stage
func (q *Queries) GetStageInfo(
	ctx context.Context, stageID int,
) (StageInfo, error) {
	rows, err := q.conn.Query(ctx, getStageInfoQuery, stageID)
	if err != nil {
		return StageInfo{}, err
	}
	defer rows.Close()

	info, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[StageInfo])
	if err != nil {
		return StageInfo{}, err
	}
	return info, nil
}

const getTrackQuery = `
SELECT ST_AsGeoJSON(ST_Transform(ST_Force2D(the_geom), 4326))
FROM racedata.stages s
JOIN geog.tracks t ON s.gpx_id = t.track_id
WHERE s.stage_id = $1
LIMIT 1;
`

// Get the stage track as a GeoJSON object
func (q *Queries) GetTrack(
	ctx context.Context, stageID int,
) (string, error) {
	rows, err := q.conn.Query(ctx, getTrackQuery, stageID)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	track, err := pgx.CollectOneRow(rows, pgx.RowTo[string])
	if err != nil {
		return "", err
	}
	return track, nil
}

const getElevationProfileQuery = `
SELECT distance, elevation
FROM racedata.stages_elevation
WHERE stage_id = $1
ORDER BY distance;
`

func (q *Queries) GetElevationProfile(
	ctx context.Context, stageID int,
) ([]ElevationPoint, error) {
	rows, err := q.conn.Query(
		ctx, getElevationProfileQuery, stageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	points, err := pgx.CollectRows(rows, pgx.RowToStructByName[ElevationPoint])
	if err != nil {
		return nil, err
	}
	return points, nil
}

type GradientQueryParams struct {
	StageID    int
	Resolution float64
}

func (q *Queries) GetGradientProfile(
	ctx context.Context, params GradientQueryParams,
) ([]GradientPoint, error) {
	elevationPoints, err := q.GetElevationProfile(ctx, params.StageID)
	if err != nil {
		return nil, err
	}
	return GetInterpolatedGradientPoints(elevationPoints, params.Resolution)
}

const getResultsQuery = `
SELECT
	rank,
	rider,
	team,
	time,
	points,
	classification
FROM racedata.riders_teams_results
WHERE stage_id = $1 AND rank <= $2
ORDER BY classification, rank ASC;
`

type ResultsQueryParams struct {
	StageID int
	TopN    int
}

func (q *Queries) GetResults(
	ctx context.Context, params ResultsQueryParams,
) ([]Result, error) {
	rows, err := q.conn.Query(ctx, getResultsQuery, params.StageID, params.TopN)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results, err := pgx.CollectRows(rows, pgx.RowToStructByName[Result])
	if err != nil {
		return nil, err
	}
	return results, nil
}

const getResultsForClassificationQuery = `
SELECT
	rank,
	rider,
	team,
	time,
	points,
	classification
FROM racedata.riders_teams_results
WHERE
	stage_id = @stage_id
	AND rank <= @top_n
	AND classification = @classification
ORDER BY rank ASC;
`

type GetResultsForClassificationParams struct {
	StageID        int
	TopN           int
	Classification Classification
}

func (q *Queries) GetResultsForClassification(
	ctx context.Context, params GetResultsForClassificationParams,
) ([]Result, error) {
	rows, err := q.conn.Query(
		ctx,
		getResultsForClassificationQuery,
		pgx.NamedArgs{
			"stage_id":       params.StageID,
			"top_n":          params.TopN,
			"classification": params.Classification,
		},
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results, err := pgx.CollectRows(rows, pgx.RowToStructByName[Result])
	if err != nil {
		return nil, err
	}
	return results, nil
}

const getResultForRankAndClassificationQuery = `
SELECT
	rank,
	rider,
	team,
	time,
	points,
	classification
FROM racedata.riders_teams_results
WHERE
	stage_id = @stage_id
	AND rank = @rank
	AND classification = @classification
`

type GetResultForRankAndClassificationParams struct {
	StageID        int
	Rank           int
	Classification Classification
}

func (q *Queries) GetResultForRankAndClassification(
	ctx context.Context, params GetResultForRankAndClassificationParams,
) (Result, error) {
	rows, err := q.conn.Query(
		ctx,
		getResultForRankAndClassificationQuery,
		pgx.NamedArgs{
			"stage_id":       params.StageID,
			"rank":           params.Rank,
			"classification": params.Classification,
		},
	)
	if err != nil {
		return Result{}, err
	}
	defer rows.Close()

	result, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[Result])
	if err != nil {
		return Result{}, err
	}
	return result, nil
}

const getRidersQuery = `
SELECT DISTINCT rider
FROM racedata.riders_teams_results
WHERE stage_id = $1 AND rider IS NOT NULL;
`

func (q *Queries) GetRiders(
	ctx context.Context, stageID int,
) ([]string, error) {
	rows, err := q.conn.Query(ctx, getRidersQuery, stageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	riders, err := pgx.CollectRows(rows, pgx.RowTo[string])
	if err != nil {
		return nil, err
	}
	return riders, nil
}

const getTeamsQuery = `
SELECT DISTINCT team
FROM racedata.riders_teams_results
WHERE stage_id = $1 AND team IS NOT NULL;
`

func (q *Queries) GetTeams(ctx context.Context, stageID int) ([]string, error) {
	rows, err := q.conn.Query(ctx, getTeamsQuery, stageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	teams, err := pgx.CollectRows(rows, pgx.RowTo[string])
	if err != nil {
		return nil, err
	}
	return teams, nil
}

const getValidResultsCountQuery = `
SELECT classification, COUNT(*)
FROM racedata.results_valid
WHERE stage_id = @stage_id
GROUP BY classification;
`

type ValidResultsCountRow struct {
	Classification Classification
	Count          int
}

type ValidResultsCount struct {
	Stage     int `json:"stage"`
	General   int `json:"general"`
	Points    int `json:"points"`
	Mountains int `json:"mountains"`
	Youth     int `json:"youth"`
	Teams     int `json:"teams"`
}

func (q *Queries) GetValidResultsCount(
	ctx context.Context, stageID int,
) (ValidResultsCount, error) {
	rows, err := q.conn.Query(ctx, getValidResultsCountQuery, pgx.NamedArgs{
		"stage_id": stageID,
	})
	if err != nil {
		return ValidResultsCount{}, err
	}
	defer rows.Close()

	counts, err := pgx.CollectRows(
		rows, pgx.RowToStructByName[ValidResultsCountRow],
	)
	if err != nil {
		return ValidResultsCount{}, err
	}
	validResultsCount := ValidResultsCount{}
	for _, count := range counts {
		switch count.Classification {
		case ClassificationStage:
			validResultsCount.Stage = count.Count
		case ClassificationGC:
			validResultsCount.General = count.Count
		case ClassificationPoints:
			validResultsCount.Points = count.Count
		case ClassificationMountains:
			validResultsCount.Mountains = count.Count
		case ClassificationYouth:
			validResultsCount.Youth = count.Count
		case ClassificationTeams:
			validResultsCount.Teams = count.Count
		}
	}
	return validResultsCount, nil
}
