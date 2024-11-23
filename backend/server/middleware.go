package server

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func logRequest(w *ResponseWriter, r *http.Request, duration time.Duration) {
	method := r.Method
	path := r.URL.EscapedPath()
	query := r.URL.Query().Encode()
	if query != "" {
		query = "?" + query
	}
	status := w.statusCode
	durationStr := fmt.Sprintf("%dms", duration.Milliseconds())
	log.Printf(
		"%s %s%s Status %d in %s", method, path, query, status, durationStr,
	)
}

func HandlerMiddleware(
	fn http.HandlerFunc, middleware ...func(http.HandlerFunc) http.HandlerFunc,
) http.HandlerFunc {
	for _, m := range middleware {
		fn = m(fn)
	}
	return fn
}

func AddRequestLogger(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		responseWriter := newResponseWriter(w)
		fn(responseWriter, r)

		logRequest(responseWriter, r, time.Since(start))
	}
}

func SetCORSHeaders(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET")
		w.Header().Set(
			"Access-Control-Allow-Headers",
			"Accept, Content-Type, Content-Length, Accept-Encoding",
		)
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}
