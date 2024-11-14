package http

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
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

// GetLastURLSegment returns the last segment of the URL path.
func GetLastURLSegment(r *http.Request) (string, error) {
	s := strings.TrimRight(r.URL.Path, "/")
	segments := strings.Split(s, "/")
	if len(segments) == 0 {
		return "", errors.New("no segments found")
	}
	return segments[len(segments)-1], nil
}

// GetStageIDFromURL returns the stage ID from the last segment of the URL.
func GetStageIDFromURL(r *http.Request) (int, error) {
	segment, err := GetLastURLSegment(r)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(segment)
}

// GetStageInfoHandler returns the stage info for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetStageInfoHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromURL(r)
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
	stage_id, err := GetStageIDFromURL(r)
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
	stage_id, err := GetStageIDFromURL(r)
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
	stage_id, err := GetStageIDFromURL(r)
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
// - topN: the number of results to return as an integer. Defaults to 5.
func GetResultsHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromURL(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	topN, err := strconv.Atoi(r.URL.Query().Get("topN"))
	if err != nil {
		topN = 5
	}

	results, err := conn.GetResults(
		context.Background(), db.ResultsQueryParams{
			StageID: stage_id,
			TopN:    topN,
		},
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// GetRidersHandler returns all the riders for a given stage.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
func GetRidersHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := GetStageIDFromURL(r)
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
	stage_id, err := GetStageIDFromURL(r)
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

// VerifyResultHandler verifies a rider/team answer for a given stage, rank and
// classification against the database.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
//
// Required Query Parameters:
// - r: rank as an integer
// - c: classification as a string
// - p: payload as a string
func VerifyResultHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	// Get Stage ID
	stage_id, err := GetStageIDFromURL(r)
	if err != nil {
		http.Error(w, "You must specify a stage ID", http.StatusBadRequest)
		return
	}

	// Check query params
	urlParams := r.URL.Query()
	if !urlParams.Has("r") || !urlParams.Has("c") || !urlParams.Has("v") {
		http.Error(
			w,
			"Query parameters 'r', 'c' and 'p' are required",
			http.StatusBadRequest,
		)
		return
	}

	// Parse rank as an integer
	rank, err := strconv.Atoi(urlParams.Get("r"))
	if err != nil {
		http.Error(
			w, "Query parameter 'r' must be an integer",
			http.StatusBadRequest,
		)
		return
	}

	// Parse classification as a db.Classification
	classification := db.Classification(urlParams.Get("c"))
	if !classification.IsValid() {
		http.Error(
			w,
			"Query parameter 'c' must be a valid classification.",
			http.StatusBadRequest,
		)
		return
	}

	// Parse payload as a string
	payload := urlParams.Get("v")

	// Get the correct rider/team from the database
	params := db.GetRiderOrTeamParams{
		StageID:        stage_id,
		Rank:           rank,
		Classification: classification,
	}
	answer, err := conn.GetRiderOrTeam(context.Background(), params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Verify the payload against the answer
	verified := lib.AreNormEqual(payload, answer.Reduce())

	// Return the result
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(verified)
}

// VerifyInfoHandler verifies a guess for a given stage info field against the
// database.
//
// Dynamic Query Segments:
// - stage_id: the stage ID as an integer
//
// Required Query Parameters:
// - f: the field to guess as a string
// - v: the guess as a string
func VerifyInfoHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	// Get the stage info
	stage_id, err := GetStageIDFromURL(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	stage_info, err := conn.GetStageInfo(context.Background(), stage_id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get guess from the query params
	queryParams := r.URL.Query()
	if !queryParams.Has("f") || !queryParams.Has("v") {
		http.Error(
			w, "Query parameters 'f' and 'v' are required",
			http.StatusBadRequest,
		)
		return
	}
	guessField := queryParams.Get("f")
	guessValue := queryParams.Get("v")

	// Get the field from the stage info
	v, err := lib.GetFieldByTag(stage_info, "json", guessField)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fieldValue := v.Interface()

	// Convert the field value to a string for checking
	answer, err := lib.ValueToString(fieldValue)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	verified := lib.AreNormEqual(guessValue, answer)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(verified)
}
