package main

import (
	"log"

	"github.com/michaelbennett99/stagehunter/backend/db"
	"github.com/michaelbennett99/stagehunter/backend/server"
)

func main() {
	pool, err := db.GetPool()
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	server := server.NewServer(pool, server.DefaultServerConfig())

	log.Printf("Listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
