package server

import (
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/michaelbennett99/stagehunter/backend/db"
)

const DefaultPort = 8080

type ServerConfig struct {
	Port int
}

func DefaultServerConfig() ServerConfig {
	return ServerConfig{
		Port: DefaultPort,
	}
}

func addRoute(
	mux *http.ServeMux,
	path string,
	pool *pgxpool.Pool,
	handler func(http.ResponseWriter, *http.Request, *db.Queries),
) {
	mux.HandleFunc(
		path,
		HandlerMiddleware(
			MakeHandler(pool, handler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)
}

type Route struct {
	path    string
	handler func(http.ResponseWriter, *http.Request, *db.Queries)
}

func NewServer(pool *pgxpool.Pool, config ServerConfig) *http.Server {
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: http.NewServeMux(),
	}

	mux := server.Handler.(*http.ServeMux)

	routes := []Route{
		{
			"/daily",
			GetDailyHandler,
		},
		{
			"/random",
			GetRandomHandler,
		},
		{
			"/stages",
			GetAllStagesHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/info", StageID),
			GetStageInfoHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/track", StageID),
			GetStageTrackHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/elevation", StageID),
			GetStageElevationHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/gradient", StageID),
			GetStageGradientHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/results", StageID),
			GetResultsHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/riders", StageID),
			GetRidersHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/teams", StageID),
			GetTeamsHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/results/correct", StageID),
			GetCorrectResultHandler,
		},
		{
			fmt.Sprintf("/stages/{%s}/results/verify", StageID),
			VerifyResultHandler,
		},
	}

	for _, route := range routes {
		addRoute(mux, route.path, pool, route.handler)
	}

	return server
}
