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
	baseRoute string
	path      string
	handler   func(http.ResponseWriter, *http.Request, *db.Queries)
}

func (r *Route) FullPath() string {
	return fmt.Sprintf("%s%s", r.baseRoute, r.path)
}

func NewRoute(
	path string,
	handler func(http.ResponseWriter, *http.Request, *db.Queries),
) Route {
	return Route{baseRoute, path, handler}
}

func NewServer(pool *pgxpool.Pool, config ServerConfig) *http.Server {
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: http.NewServeMux(),
	}

	mux := server.Handler.(*http.ServeMux)

	routes := []Route{
		NewRoute("/daily", GetDailyHandler),
		NewRoute("/random", GetRandomHandler),
		NewRoute("/stages", GetAllStagesHandler),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/info", StageID),
			GetStageInfoHandler,
		),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/track", StageID),
			GetStageTrackHandler,
		),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/elevation", StageID),
			GetStageElevationHandler,
		),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/gradient", StageID),
			GetStageGradientHandler,
		),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/results", StageID),
			GetResultsHandler,
		),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/riders", StageID),
			GetRidersHandler,
		),
		NewRoute(
			fmt.Sprintf(
				"/stages/{%s}/results/{%s}",
				StageID, ResultClassification,
			),
			GetResultsForClassificationHandler,
		),
		NewRoute(
			fmt.Sprintf(
				"/stages/{%s}/results/{%s}/{%s}",
				StageID, ResultClassification, Rank,
			),
			GetResultForRankAndClassificationHandler,
		),
		NewRoute(
			fmt.Sprintf(
				"/stages/{%s}/results/{%s}/{%s}/{%s}",
				StageID, ResultClassification, Rank, ResultField,
			),
			GetResultFieldForRankAndClassificationHandler,
		),
		NewRoute(
			fmt.Sprintf("/stages/{%s}/teams", StageID),
			GetTeamsHandler,
		),
		NewRoute(
			fmt.Sprintf(
				"/stages/{%s}/verify/info/{%s}",
				StageID, InfoField,
			),
			VerifyInfoHandler,
		),
		NewRoute(
			fmt.Sprintf(
				"/stages/{%s}/verify/results/{%s}/{%s}",
				StageID, ResultClassification, Rank,
			),
			VerifyResultHandler,
		),
	}

	for _, route := range routes {
		addRoute(mux, route.FullPath(), pool, route.handler)
	}

	return server
}
