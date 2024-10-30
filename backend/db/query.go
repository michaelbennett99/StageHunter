package db

import (
	"context"
)

const getDailyStageQuery = `
SELECT stage_id FROM racedata.daily
WHERE daily_id = (SELECT MAX(daily_id) FROM racedata.daily)
LIMIT 1;
`

func (q *Queries) GetDailyStage(ctx context.Context) (int, error) {
	var id int
	row := q.conn.QueryRow(ctx, getDailyStageQuery)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

const getRandomStageQuery = `
SELECT racedata.get_random_stage_id();
`

func (q *Queries) GetRandomStage(ctx context.Context) (int, error) {
	var id int
	row := q.conn.QueryRow(ctx, getRandomStageQuery)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

const getStageInfoQuery = `
SELECT
	gt,
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
	var info StageInfo
	row := q.conn.QueryRow(ctx, getStageInfoQuery, stageID)
	if err := row.Scan(
		&info.GrandTour,
		&info.Year,
		&info.StageNumber,
		&info.StageType,
		&info.StageStart,
		&info.StageEnd,
		&info.StageLength,
	); err != nil {
		return StageInfo{}, err
	}
	return info, nil
}

const getTrackQuery = `
SELECT ST_AsGeoJSON(the_geom, 6)
FROM racedata.stages s
JOIN geog.tracks t ON s.gpx_id = t.track_id
WHERE s.stage_id = $1
LIMIT 1;
`

// Get the stage track as a GeoJSON object
func (q *Queries) GetTrack(
	ctx context.Context, stageID int,
) (string, error) {
	var track string
	row := q.conn.QueryRow(ctx, getTrackQuery, stageID)
	if err := row.Scan(&track); err != nil {
		return "", err
	}
	return track, nil
}

const getElevationProfileQuery = `
SELECT distance, ele
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

	points := []ElevationPoint{}
	for rows.Next() {
		var point ElevationPoint
		if err := rows.Scan(
			&point.Distance, &point.Elevation,
		); err != nil {
			return nil, err
		}
		points = append(points, point)
	}
	return points, nil
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

	results := []Result{}
	for rows.Next() {
		var result Result
		if err := rows.Scan(
			&result.Rank,
			&result.Name,
			&result.Team,
			&result.Time,
			&result.Points,
			&result.Classification,
		); err != nil {
			return nil, err
		}
		results = append(results, result)
	}
	return results, nil
}
