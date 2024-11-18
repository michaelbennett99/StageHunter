package main

import (
	"log"
	"net/http"

	db "github.com/michaelbennett99/stagehunter/backend/db"
	myhttp "github.com/michaelbennett99/stagehunter/backend/http"
)

func main() {
	pool, err := db.GetPool()
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	http.HandleFunc(
		"/daily",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetDailyHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)
	http.HandleFunc(
		"/random",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetRandomHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)
	http.HandleFunc(
		"/stages",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetAllStagesHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)
	http.HandleFunc(
		"/stage/info/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetStageInfoHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/track/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetStageTrackHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/elevation/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetStageElevationHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/gradient/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetStageGradientHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/results/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetResultsHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/riders/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetRidersHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/teams/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetTeamsHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/results/correct/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetCorrectResultHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/results/verify/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.VerifyResultHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/info/correct/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetCorrectInfoHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/info/verify/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.VerifyInfoHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	http.HandleFunc(
		"/stage/results/count/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetValidResultsCountHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	log.Println("Listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
