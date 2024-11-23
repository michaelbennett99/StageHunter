package server

import (
	"context"

	"github.com/michaelbennett99/stagehunter/backend/db"
	"github.com/michaelbennett99/stagehunter/backend/lib"
)

func GetInfoField(
	conn *db.Queries, stage_id int, field string,
) (any, error) {
	stage_info, err := conn.GetStageInfo(context.Background(), stage_id)
	if err != nil {
		return "", err
	}

	v, err := lib.GetFieldByTag(stage_info, "json", field)
	if err != nil {
		return "", err
	}

	return v.Interface(), nil
}
