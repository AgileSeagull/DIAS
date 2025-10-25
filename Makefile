.PHONY: help build up down restart logs ps shell-backend shell-frontend shell-db clean prune

help: ## Show this help message
	@echo "DIAS - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

build: ## Build Docker images
	docker compose build

build-dev: ## Build development images
	docker compose -f docker-compose.dev.yml build

up: ## Start all services in production mode
	docker compose up -d

up-dev: ## Start all services in development mode
	docker compose -f docker-compose.dev.yml up -d

down: ## Stop all services
	docker compose down
	docker compose -f docker-compose.dev.yml down

restart: down up ## Restart all services

logs: ## Show logs from all services
	docker compose logs -f

logs-dev: ## Show logs from development services
	docker compose -f docker-compose.dev.yml logs -f

ps: ## Show running containers
	docker compose ps

shell-backend: ## Open a shell in backend container
	docker compose exec backend sh

shell-frontend: ## Open a shell in frontend container
	docker compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d dias

init-db: ## Initialize database schema
	docker compose exec backend npm run init-db

backup-db: ## Backup database to backup.sql
	docker compose exec postgres pg_dump -U postgres dias > backup.sql

restore-db: ## Restore database from backup.sql
	docker compose exec -T postgres psql -U postgres dias < backup.sql

clean: ## Stop containers and remove volumes
	docker compose down -v
	docker compose -f docker-compose.dev.yml down -v

prune: ## Remove all containers, images, and volumes
	docker compose down -v --rmi all --remove-orphans
	docker compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans

install: ## Install dependencies locally (non-Docker)
	cd backend && npm install
	npm install

dev: ## Run in development mode locally (non-Docker)
	cd backend && npm run dev & npm run dev

.DEFAULT_GOAL := help

