package http

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/michaelbennett99/stagehunter/backend/db"
)

func logRequest(r *http.Request) {
	log.Printf("%s %s", r.Method, r.URL.Path)
}

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

func AddRequestLogger(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logRequest(r)
		fn(w, r)
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

func GetStageInfoHandler(
	w http.ResponseWriter, r *http.Request, conn *db.Queries,
) {
	stage_id := strings.Split(r.URL.Path, "/stage/info/")[1]
	if stage_id == "" {
		http.Error(w, "stage_id is required", http.StatusBadRequest)
	}
	stage_id_int, err := strconv.Atoi(stage_id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	stage_info, err := conn.GetStageInfo(
		context.Background(), stage_id_int,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stage_info)
}
