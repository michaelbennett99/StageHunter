package server

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/michaelbennett99/stagehunter/backend/db"
	"github.com/michaelbennett99/stagehunter/backend/lib"
)

// MakeHandler creates a new HTTP handler function that acquires a database
// connection from the provided pool and calls the provided function with the
// Queries object.
func MakeHandler(
	pool *pgxpool.Pool,
	fn func(http.ResponseWriter, *http.Request, *db.Queries),
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Acquire a connection from the pool
		conn, err := pool.Acquire(context.Background())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer conn.Release()

		// Create a new Queries object with the acquired connection
		queries := db.New(conn.Conn())

		// Call the provided handler function with the Queries object
		fn(w, r, queries)
	}
}

// DefaultHandler returns a simple "Request OK" response.
func DefaultHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Request OK"))
}

// GetDailyHandler returns the ID of the daily stage from the database.
func GetDailyHandler(w http.ResponseWriter, r *http.Request, conn *db.Queries) {
	stage_id, err := conn.GetDailyStage(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stage_id)
}

// GetRandomHandler returns a random stage ID from the database.
func GetRandomHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := conn.GetRandomStage(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stage_id)
}

// GetAllStagesHandler returns the IDs of all the stages in the database.
func GetAllStagesHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stages, err := conn.GetAllStages(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stages)
}

// GetStageInfoHandler returns the stage info for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetStageInfoHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	stage_info, err := conn.GetStageInfo(
		context.Background(), stage_id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stage_info)
}

// GetStageTrackHandler returns the track for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetStageTrackHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	track, err := conn.GetTrack(context.Background(), stage_id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Cache-Control", "public, max-age=3600")
	w.Header().Set("Content-Type", "application/json")

	if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()

		gz.Write([]byte(track))
		return
	}

	w.Write([]byte(track))
}

// GetStageElevationHandler returns the raw elevation profile for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetStageElevationHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	elevation, err := conn.GetElevationProfile(
		context.Background(), stage_id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	json.NewEncoder(w).Encode(elevation)
}

// GetStageGradientHandler returns the gradient profile for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
//
// Optional Query Parameters:
// - resolution: the resolution of the gradient profile as a float in meters.
// Defaults to 10.
func GetStageGradientHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resolution, err := strconv.ParseFloat(r.URL.Query().Get("resolution"), 64)
	if err != nil {
		resolution = 10
	}

	gradient, err := conn.GetGradientProfile(
		context.Background(), db.GradientQueryParams{
			StageID:    stage_id,
			Resolution: resolution,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	json.NewEncoder(w).Encode(gradient)
}

// GetResultsHandler returns the top N results for a given stage for each
// classification.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
//
// Optional Query Parameters:
// - topN: the number of results to return as an integer. Defaults to 1000.
func GetResultsHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	topNParam := NewIntQueryParamWithDefault(topNName, topNDefault)
	queryParams, _, _, err := GetQueryParams(
		r,
		nil,
		[]QueryParamInterface{topNParam},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	topN, err := GetParamValue[int](queryParams[topNName])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dbResults, err := conn.GetResults(
		context.Background(), db.ResultsQueryParams{
			StageID: stage_id,
			TopN:    topN,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	results := NewResults(dbResults)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func GetResultsForClassificationHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	classification, err := GetResultClassificationFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	topNParam := NewIntQueryParamWithDefault(topNName, topNDefault)
	queryParams, _, _, err := GetQueryParams(
		r,
		nil,
		[]QueryParamInterface{topNParam},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	topN, err := GetParamValue[int](queryParams[topNName])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dbResults, err := conn.GetResultsForClassification(
		context.Background(), db.GetResultsForClassificationParams{
			StageID:        stage_id,
			TopN:           topN,
			Classification: classification,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	results := NewResults(dbResults)

	fmt.Println(results)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// GetCorrectResultHandler returns the correct rider/team for a given stage,
// rank and classification.
func GetResultForRankAndClassificationHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	classification, err := GetResultClassificationFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rank, err := GetRankFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dbResult, err := conn.GetResultForRankAndClassification(
		context.Background(), db.GetResultForRankAndClassificationParams{
			StageID:        stage_id,
			Rank:           rank,
			Classification: classification,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	result := NewResult(dbResult)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func GetResultFieldForRankAndClassificationHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	classification, err := GetResultClassificationFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rank, err := GetRankFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	field, err := GetResultFieldFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dbResult, err := conn.GetResultForRankAndClassification(
		context.Background(), db.GetResultForRankAndClassificationParams{
			StageID:        stage_id,
			Rank:           rank,
			Classification: classification,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	result := NewResult(dbResult)

	fieldValue, err := lib.GetFieldByTag(result, "json", field)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fieldValue.Interface())
}

// GetRidersHandler returns all the riders for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetRidersHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	riders, err := conn.GetRiders(context.Background(), stage_id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(riders)
}

// GetTeamsHandler returns all the teams for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetTeamsHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	teams, err := conn.GetTeams(context.Background(), stage_id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// GetCorrectInfoHandler returns the correct info for a given stage and field.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
//
// Required Query Parameters:
// - f: the field to get as a string
func GetInfoFieldHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	// Get the stage info
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the field from the query params
	field := r.PathValue(InfoField)

	answer, err := GetInfoField(conn, stage_id, field)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(answer)
}

// VerifyInfoHandler verifies a guess for a given stage info field against the
// database.
func VerifyInfoHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	// Get the stage info
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the field from the route segment
	field, err := GetInfoFieldFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the correct info from the database
	answer, err := GetInfoField(conn, stage_id, field)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	strAnswer, err := lib.ValueToString(answer)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get guess from the query params
	valueParam := NewStringQueryParam("v")
	queryParams, _, _, err := GetQueryParams(
		r,
		[]QueryParamInterface{valueParam},
		nil,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	guessValue, err := GetParamValue[string](queryParams["v"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	verified := lib.AreNormEqual(guessValue, strAnswer)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(verified)
}

// VerifyResultHandler verifies a rider/team answer for a given stage, rank and
// classification against the database.
func VerifyResultHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	// Get Stage ID
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, "You must specify a stage ID", http.StatusBadRequest)
		return
	}

	// Get path segments
	classification, err := GetResultClassificationFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rank, err := GetRankFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get the correct result from the database
	dbResult, err := conn.GetResultForRankAndClassification(
		context.Background(), db.GetResultForRankAndClassificationParams{
			StageID:        stage_id,
			Rank:           rank,
			Classification: classification,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	answer, err := NewRiderOrTeamFromDBResult(dbResult)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the payload from the query params
	valueParam := NewStringQueryParam("v")
	queryParams, _, _, err := GetQueryParams(
		r,
		[]QueryParamInterface{valueParam},
		nil,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	payload, err := GetParamValue[string](queryParams["v"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	verified := lib.AreNormEqual(payload, answer.Reduce())

	// Return the result
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(verified)
}

func GetValidResultsCountHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	validResultsCount, err := conn.GetValidResultsCount(
		context.Background(), stage_id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(validResultsCount)
}
