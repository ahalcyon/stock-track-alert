# ==============================================================================
# VARIABLES
# ==============================================================================

# 環境を切り替えるための変数 (デフォルトは dev)
# 使用例: make plan ENV=staging
ENV ?= dev

# Terraformのディレクトリ
TF_DIR := infra/envs/$(ENV)
TF_GLOBAL_DIR := infra/global

# ==============================================================================
# HELP
# ==============================================================================

.PHONY: help
help:
	@echo "Usage: make [target] [ENV=environment]"
	@echo ""
	@echo "Targets:"
	@echo "  up                    - Start docker containers in the background."
	@echo "  down                  - Stop docker containers."
	@echo "  init                  - Initialize a Terraform working directory for the specified environment."
	@echo "  plan                  - Create a Terraform execution plan for the specified environment."
	@echo "  apply                 - Apply the Terraform changes for the specified environment."
	@echo "  destroy               - Destroy Terraform managed infrastructure for the specified environment."
	@echo "  global-init           - Initialize Terraform for the global environment."
	@echo "  global-plan           - Create a Terraform execution plan for the global environment."
	@echo "  global-apply          - Apply the Terraform changes for the global environment."
	@echo ""
	@echo "Arguments:"
	@echo "  ENV                   - The environment to target (e.g., dev, staging, prod). Defaults to 'dev'."

# ==============================================================================
# DOCKER COMMANDS
# ==============================================================================

.PHONY: up
up:
	@echo "Starting Docker containers..."
	docker-compose up -d

.PHONY: down
down:
	@echo "Stopping Docker containers..."
	docker-compose down

# ==============================================================================
# TERRAFORM COMMANDS (for environments like dev, staging, prod)
# ==============================================================================

.PHONY: init plan apply destroy

init:
	@echo "Initializing Terraform for [$(ENV)] environment..."
	terraform -chdir=$(TF_DIR) init \
		-backend-config="bucket=stock-track-alert-tfstate" \
		-backend-config="key=$(ENV)/terraform.tfstate" \
		-backend-config="region=ap-northeast-1" \
		-backend-config="dynamodb_table=stock-track-alert-tfstate-lock"

plan:
	@echo "Planning Terraform changes for [$(ENV)] environment..."
	terraform -chdir=$(TF_DIR) plan

apply:
	@echo "Applying Terraform changes for [$(ENV)] environment..."
	terraform -chdir=$(TF_DIR) apply -auto-approve

destroy:
	@echo "Destroying Terraform infrastructure for [$(ENV)] environment..."
	terraform -chdir=$(TF_DIR) destroy -auto-approve

# ==============================================================================
# TERRAFORM COMMANDS (for global environment)
# ==============================================================================

.PHONY: global-init global-plan global-apply

global-init:
	@echo "Initializing Terraform for [global] environment..."
	terraform -chdir=$(TF_GLOBAL_DIR) init

global-plan:
	@echo "Planning Terraform changes for [global] environment..."
	terraform -chdir=$(TF_GLOBAL_DIR) plan

global-apply:
	@echo "Applying Terraform changes for [global] environment..."
	terraform -chdir=$(TF_GLOBAL_DIR) apply -auto-approve