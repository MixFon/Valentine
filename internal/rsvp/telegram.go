package rsvp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

const telegramAPI = "https://api.telegram.org/bot%s/sendMessage"

// TelegramNotifier шлёт сообщение о принятом ответе в Telegram.
// Токен и chat id берутся из окружения и никогда не хранятся в репозитории.
type TelegramNotifier struct {
	token  string
	chatID string
	client *http.Client
}

func NewTelegramNotifier() *TelegramNotifier {
	return &TelegramNotifier{
		token:  os.Getenv("TELEGRAM_BOT_TOKEN"),
		chatID: os.Getenv("TELEGRAM_CHAT_ID"),
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (n *TelegramNotifier) Notify(e Entry) error {
	if n.token == "" || n.chatID == "" {
		log.Println("telegram: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы, уведомление не отправлено")
		return nil
	}

	text := fmt.Sprintf("Есть ответ 🐾\nДата: %s\nФормат: %s", e.Date, e.Format)
	body, err := json.Marshal(map[string]string{
		"chat_id": n.chatID,
		"text":    text,
	})
	if err != nil {
		return err
	}

	url := fmt.Sprintf(telegramAPI, n.token)
	resp, err := n.client.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("telegram: unexpected status %d", resp.StatusCode)
	}
	return nil
}
