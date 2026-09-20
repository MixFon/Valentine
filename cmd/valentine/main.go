// Command valentine — точка входа приложения: HTTP-роутер и статика,
// вкомпиленная из web/dist на этапе сборки (см. Makefile).
package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"time"

	"valentine/internal/rsvp"
)

//go:embed all:dist
var distFS embed.FS

const addr = "127.0.0.1:8081"

func main() {
	static, err := fs.Sub(distFS, "dist")
	if err != nil {
		log.Fatalf("static fs: %v", err)
	}

	store := rsvp.NewFileStore("data/rsvp.json")
	notifier := rsvp.NewTelegramNotifier()
	limiter := rsvp.NewRateLimiter(1, time.Minute)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/rsvp", rsvp.Handler(store, notifier, limiter))
	mux.Handle("/", http.FileServer(http.FS(static)))

	srv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
	}

	log.Printf("valentine listening on %s", addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
