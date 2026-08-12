include .env

MIGRATION_PATH=./migrations

# ===========================
# Migration
# ===========================

migration-up:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" up

migration-down:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" down

migration-down-one:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" down 1

migration-force:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" force 1

migration-version:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" version

migration-drop:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" drop

# ===========================
# Create Migration
# ===========================

migration-create:
	migrate create -ext sql -dir $(MIGRATION_PATH) -seq $(name)

# ===========================
# Delete all migrate and run migrate again
# ===========================

fresh:
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" drop -f
	migrate -path $(MIGRATION_PATH) -database "$(DATABASE_URL)" up

# ===========================
# Help
# ===========================
.PHONY: help

help:
	@echo "Available commands:"
	@echo "  make migration-create name=<migration_name>"
	@echo "  make migration-up"
	@echo "  make migration-down"
	@echo "  make migration-down-one"
	@echo "  make migration-version"
	@echo "  make migration-force"
	@echo "  make migration-drop"
	@echo "  make fresh"