.PHONY: dev build clean lint lint-fix test check front-dev front-build

# Variables
APP_NAME := toolbox
MAIN_FILE := main.go
BUILD_DIR := build/bin
GO_MODULE := $(shell go list -m)

# Default target
all: build

# Développement
dev:
	wails dev

# Build for current platform
build:
	wails build

# Build pour toutes les plateformes
build-all:
	wails build -platform darwin/universal,windows/amd64,linux/amd64

# Nettoyer les fichiers générés
clean:
	rm -rf $(BUILD_DIR)
	rm -rf frontend/dist
	rm -rf frontend/.next
	rm -rf frontend/node_modules/.cache

# Linting Go
lint:
	golangci-lint run ./...
	cd frontend && npm run lint

# Fix linting issues
lint-fix:
	cd frontend && npm run lint:fix
	cd frontend && npm run format

# Vérification de type TypeScript
type-check:
	cd frontend && npm run type-check

# Tests Go
test:
	go test -v ./...

# Vérifier tout (lint + tests + type-check)
check: lint test type-check

# Frontend dev
front-dev:
	cd frontend && npm run dev

# Frontend build
front-build:
	cd frontend && npm run build

# Installer les dépendances
deps:
	go mod tidy
	cd frontend && npm install

# Lancer en mode production
run:
	./$(BUILD_DIR)/$(APP_NAME)

# Help
help:
	@echo "Available targets:"
	@echo "  dev          : Run in development mode"
	@echo "  build        : Build for current platform"
	@echo "  build-all    : Build for all platforms"
	@echo "  clean        : Clean build artifacts"
	@echo "  lint         : Run linters"
	@echo "  lint-fix     : Fix linting issues"
	@echo "  test         : Run Go tests"
	@echo "  check        : Run all checks (lint, test, type-check)"
	@echo "  deps         : Install dependencies"
	@echo "  front-dev    : Run frontend in dev mode"
	@echo "  front-build  : Build frontend"
	@echo "  run          : Run built application"

# Default target
.DEFAULT_GOAL := help 