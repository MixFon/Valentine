package rsvp

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// FileStore пишет единственный ответ в JSON-файл. Ответ на приглашение
// ровно один, поэтому Save перезатирает файл, а не ведёт журнал записей.
type FileStore struct {
	path string
	mu   sync.Mutex
}

func NewFileStore(path string) *FileStore {
	return &FileStore{path: path}
}

func (s *FileStore) Save(e Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(e, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.path, data, 0o600)
}
