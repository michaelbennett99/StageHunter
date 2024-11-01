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
		"/stage/results/",
		myhttp.HandlerMiddleware(
			myhttp.MakeHandler(pool, myhttp.GetResultsHandler),
			myhttp.AddRequestLogger,
			myhttp.SetCORSHeaders,
		),
	)

	log.Println("Listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
