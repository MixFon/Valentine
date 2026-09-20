.PHONY: dev build deploy check

dev: ## vite dev server + go run, hot reload фронта
	@trap 'kill 0' EXIT; \
	go run ./cmd/valentine & \
	npm --prefix web run dev

build: ## vite build -> web/dist, затем go build -o bin/valentine
	npm --prefix web run build
	go build -o bin/valentine ./cmd/valentine
	@touch cmd/valentine/dist/.gitkeep # vite emptyOutDir выметает плейсхолдер, нужен для чистого клона без сборки фронта

deploy: build ## build + scp на VPS + systemctl restart valentine
	./deploy.sh

check: ## tsc --noEmit, go vet, gofmt -l
	npm --prefix web run check
	go vet ./...
	gofmt -l .
