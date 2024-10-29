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
		"/", myhttp.AddRequestLogger(myhttp.DefaultHandler),
	)
	http.HandleFunc(
		"/daily",
		myhttp.AddRequestLogger(
			myhttp.MakeHandler(pool, myhttp.GetDailyHandler),
		),
	)
	http.HandleFunc(
		"/random",
		myhttp.AddRequestLogger(
			myhttp.MakeHandler(pool, myhttp.GetRandomHandler),
		),
	)
	http.HandleFunc(
		"/stage/info/",
		myhttp.AddRequestLogger(
			myhttp.MakeHandler(pool, myhttp.GetStageInfoHandler),
		),
	)

	log.Println("Listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
