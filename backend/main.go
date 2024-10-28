package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

func run() error {
	ctx := context.Background()

	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	return nil
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
