package db

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DBConn interface {
	QueryRow(ctx context.Context, sql string, arguments ...any) pgx.Row
	Query(ctx context.Context, sql string, arguments ...any) (pgx.Rows, error)
	Exec(
		ctx context.Context, sql string, arguments ...any,
	) (commandTag pgconn.CommandTag, err error)
}

type Queries struct {
	conn DBConn
}

func (q *Queries) WithConn(conn DBConn) *Queries {
	q.conn = conn
	return q
}

func New(conn DBConn) *Queries {
	return &Queries{conn: conn}
}

func GetPool() (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(
		context.Background(), os.Getenv("DATABASE_URL"),
	)
	if err != nil {
		return nil, err
	}
	return pool, nil
}

func GetConn() (DBConn, error) {
	conn, err := pgx.Connect(
		context.Background(), os.Getenv("DATABASE_URL"),
	)
	if err != nil {
		return nil, err
	}
	return conn, nil
}
