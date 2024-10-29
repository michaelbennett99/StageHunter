package db

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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
