package rsvp

import (
	"sync"
	"time"
)

// RateLimiter — простое ограничение частоты запросов по IP в памяти.
// Аудитория сайта — один человек, поэтому этого достаточно без внешнего хранилища.
type RateLimiter struct {
	limit  int
	window time.Duration

	mu   sync.Mutex
	hits map[string][]time.Time
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		limit:  limit,
		window: window,
		hits:   make(map[string][]time.Time),
	}
}

func (r *RateLimiter) Allow(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-r.window)

	kept := r.hits[ip][:0]
	for _, t := range r.hits[ip] {
		if t.After(cutoff) {
			kept = append(kept, t)
		}
	}

	if len(kept) >= r.limit {
		r.hits[ip] = kept
		return false
	}

	r.hits[ip] = append(kept, now)
	return true
}
