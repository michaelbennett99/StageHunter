package http

import (
	"net/http"
)

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
		logRequest(r)
		fn(w, r)
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
