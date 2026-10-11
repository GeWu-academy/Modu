.PHONY: dev web api format test

dev:
	pnpm dev

web:
	pnpm --filter @your-erp/web dev

api:
	cd apps/api && go run ./cmd/server

format:
	cd apps/api && gofmt -w $$(find . -name '*.go' -type f)

test:
	cd apps/api && go test ./...
