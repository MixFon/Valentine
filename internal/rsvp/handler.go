package rsvp

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"strings"
	"time"
)

const maxBodyBytes = 1 << 12 // 4 КБ достаточно для двух коротких строк

type saver interface {
	Save(Entry) error
}

type notifier interface {
	Notify(Entry) error
}

type limiter interface {
	Allow(ip string) bool
}

func Handler(s saver, n notifier, l limiter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		if !l.Allow(ip) {
			http.Error(w, "слишком много попыток, подожди немного", http.StatusTooManyRequests)
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

		var req Request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "не получилось прочитать запрос", http.StatusBadRequest)
			return
		}

		req.Date = strings.TrimSpace(req.Date)
		req.Format = strings.TrimSpace(req.Format)
		if req.Date == "" || req.Format == "" {
			http.Error(w, "нужны и дата, и формат", http.StatusBadRequest)
			return
		}

		entry := Entry{
			Date:        req.Date,
			Format:      req.Format,
			SubmittedAt: time.Now(),
		}

		if err := s.Save(entry); err != nil {
			log.Printf("rsvp: save: %v", err)
			http.Error(w, "не получилось сохранить ответ", http.StatusInternalServerError)
			return
		}

		if err := n.Notify(entry); err != nil {
			log.Printf("rsvp: telegram notify: %v", err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	}
}

func clientIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		return strings.TrimSpace(strings.Split(fwd, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
