up:
	docker-compose up -d

down:
	docker-compose down

init:
	terraform -chdir=infra/envs/dev init \
		-backend-config="bucket=stock-track-alert-tfstate" \
		-backend-config="key=dev/terraform.tfstate" \
		-backend-config="region=ap-northeast-1" \
		-backend-config="dynamodb_table=stock-track-alert-tfstate-lock"

plan:
	terraform -chdir=infra/envs/dev plan

apply:
	terraform -chdir=infra/envs/dev apply -auto-approve

