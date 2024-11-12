package http

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/michaelbennett99/stagehunter/backend/db"
	"github.com/michaelbennett99/stagehunter/backend/lib"
)

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

func DefaultHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Request OK"))
}

func GetDailyHandler(w http.ResponseWriter, r *http.Request, conn *db.Queries) {
	stage_id, err := conn.GetDailyStage(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stage_id)
}

func GetRandomHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id, err := conn.GetRandomStage(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stage_id)
}

func GetAllStagesHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stages, err := conn.GetAllStages(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stages)
}

func GetLastURLSegment(r *http.Request) (string, error) {
	s := strings.TrimRight(r.URL.Path, "/")
	segments := strings.Split(s, "/")
	if len(segments) == 0 {
		return "", errors.New("no segments found")
	}
	return segments[len(segments)-1], nil
}

func GetStageIDFromURL(r *http.Request) (int, error) {
	segment, err := GetLastURLSegment(r)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(segment)
}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stage_info)
}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(elevation)
}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(gradient)
}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(riders)
}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(teams)
}

func VerifyResultHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	// Get query params
	stage_id, err := GetStageIDFromURL(r)
	if err != nil {
		http.Error(w, "You must specify a stage ID", http.StatusBadRequest)
		return
	}

	urlParams := r.URL.Query()
	if !urlParams.Has("r") || !urlParams.Has("c") || !urlParams.Has("p") {
		http.Error(
			w,
			"Query parameters 'r', 'c' and 'p' are required",
			http.StatusBadRequest,
		)
		return
	}

	rank, err := strconv.Atoi(urlParams.Get("r"))
	if err != nil {
		http.Error(
			w, "Query parameter 'r' must be an integer",
			http.StatusBadRequest,
		)
		return
	}
	classification := db.Classification(urlParams.Get("c"))
	if !classification.IsValid() {
		http.Error(
			w,
			"Query parameter 'c' must be a valid classification.",
			http.StatusBadRequest,
		)
		return
	}
	payload := urlParams.Get("p")

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

	verified := lib.AreNormEqual(payload, answer.Reduce())

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(verified)
}

func VerifyInfoHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
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
	v := reflect.ValueOf(stage_info)
	f := v.FieldByName(guessField)
	if !f.IsValid() {
		possibleFields := []string{}
		for i := 0; i < v.NumField(); i++ {
			possibleFields = append(possibleFields, v.Type().Field(i).Name)
		}
		http.Error(
			w,
			"Invalid f parameter. Possible values are: "+
				strings.Join(possibleFields, ", "),
			http.StatusBadRequest,
		)
		return
	}
	fieldValue := f.Interface()
	var answer string
	switch v := fieldValue.(type) {
	case string:
		answer = v
	case db.StageType:
		answer = string(v)
	case db.GrandTour:
		answer = string(v)
	case int:
		answer = strconv.Itoa(v)
	default:
		http.Error(
			w, "Unsupported field type", http.StatusInternalServerError,
		)
		return
	}

	verified := lib.AreNormEqual(guessValue, answer)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(verified)
}
