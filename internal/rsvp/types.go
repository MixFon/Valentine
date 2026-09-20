package rsvp

import "time"

// Request — тело POST /api/rsvp. Значения date и format приходят
// с шагов "Киш" и "Ириска" такими, какими их задаёт web/src/content.ts.
type Request struct {
	Date   string `json:"date"`
	Format string `json:"format"`
}

// Entry — то, что реально сохраняется и уходит в Telegram.
type Entry struct {
	Date        string    `json:"date"`
	Format      string    `json:"format"`
	SubmittedAt time.Time `json:"submittedAt"`
}
