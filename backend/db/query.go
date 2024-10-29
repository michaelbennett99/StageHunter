package db

import (
	"context"
)

const getDailyStageQuery = `
SELECT stage_id FROM racedata.daily
WHERE daily_id = (SELECT MAX(daily_id) FROM racedata.daily);
`

func (q *Queries) GetDailyStage(ctx context.Context) (StageID, error) {
	var id StageID
	row := q.conn.QueryRow(ctx, getDailyStageQuery)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

const getRandomStageQuery = `
SELECT racedata.get_random_stage_id();
`

func (q *Queries) GetRandomStage(ctx context.Context) (StageID, error) {
	var id StageID
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
WHERE stage_id = $1;
`

// Get descriptive information about a stage
func (q *Queries) GetStageInfo(
	ctx context.Context, stageID StageID,
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
