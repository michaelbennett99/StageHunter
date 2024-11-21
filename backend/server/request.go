package server

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/michaelbennett99/stagehunter/backend/db"
)

// GetStageIDFromRequest returns the stage ID from the last segment of the URL.
func GetStageIDFromRequest(r *http.Request) (int, error) {
	value := r.PathValue(StageID)
	if value == "" {
		return 0, errors.New("stage ID is required")
	}
	return strconv.Atoi(value)
}

func GetInfoFieldFromRequest(r *http.Request) (string, error) {
	value := r.PathValue(InfoField)
	if value == "" {
		return "", errors.New("info field is required")
	}
	return value, nil
}

func GetResultClassificationFromRequest(
	r *http.Request,
) (db.Classification, error) {
	value := r.PathValue(ResultClassification)
	if value == "" {
		return "", errors.New("result classification is required")
	}
	classification := db.Classification(value)
	if !classification.IsValid() {
		return "", errors.New("invalid result classification")
	}
	return classification, nil
}

func GetRankFromRequest(r *http.Request) (int, error) {
	value := r.PathValue(Rank)
	if value == "" {
		return 0, errors.New("rank is required")
	}
	return strconv.Atoi(value)
}
