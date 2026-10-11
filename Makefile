.PHONY: dev web admin app api format test

dev: web

web:
	pnpm dev:web

admin:
	pnpm dev:admin

app:
	pnpm dev:app

api:
	cd apps/api && go run ./cmd/server

format:
	cd apps/api && gofmt -w $$(find . -name '*.go' -type f)

test:
	pnpm check:boundaries
	pnpm test
	cd apps/api && go test ./...
