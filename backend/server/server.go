package server

import (
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
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

func NewServer(pool *pgxpool.Pool, config ServerConfig) *http.Server {
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: nil,
	}

	http.HandleFunc(
		"/daily",
		HandlerMiddleware(
			MakeHandler(pool, GetDailyHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)
	http.HandleFunc(
		"/random",
		HandlerMiddleware(
			MakeHandler(pool, GetRandomHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)
	http.HandleFunc(
		"/stages",
		HandlerMiddleware(
			MakeHandler(pool, GetAllStagesHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)
	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/info", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetStageInfoHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/track", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetStageTrackHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/elevation", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetStageElevationHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/gradient", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetStageGradientHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/results", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetResultsHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/riders", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetRidersHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/teams", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetTeamsHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/results/correct", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetCorrectResultHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/results/verify", StageID),
		HandlerMiddleware(
			MakeHandler(pool, VerifyResultHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/info/correct", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetCorrectInfoHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/info/verify", StageID),
		HandlerMiddleware(
			MakeHandler(pool, VerifyInfoHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	http.HandleFunc(
		fmt.Sprintf("/stages/{%s}/results/count", StageID),
		HandlerMiddleware(
			MakeHandler(pool, GetValidResultsCountHandler),
			AddRequestLogger,
			SetCORSHeaders,
		),
	)

	return server
}
