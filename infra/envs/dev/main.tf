provider "aws" {
  region = "ap-northeast-1"
}

module "dynamodb" {
  source     = "../../modules/dynamodb"
  table_name = "stock-track-alert-watchlist-dev"
}

module "sqs" {
  source                 = "../../modules/sqs"
  queue_name             = "stock-track-alert-queue-dev"
  dead_letter_queue_name = "stock-track-alert-dlq-dev"
}

# ECR
resource "aws_ecr_repository" "poller" {
  name = "poller"
}

resource "aws_ecr_repository" "notifier" {
  name = "notifier"
}

# IAM

# IAM Role for Poller
resource "aws_iam_role" "poller" {
  name = "poller-lambda-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Poller
resource "aws_iam_policy" "poller" {
  name   = "poller-lambda-policy"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = [
          "secretsmanager:GetSecretValue"
        ],
        Effect   = "Allow",
        Resource = aws_secretsmanager_secret.finnhub_api_key.arn
      },
      {
        Action   = [
          "dynamodb:Scan"
        ],
        Effect   = "Allow",
        Resource = module.dynamodb.table_arn
      },
      {
        Action   = [
          "sqs:SendMessage"
        ],
        Effect   = "Allow",
        Resource = module.sqs.queue_arn
      }
    ]
  })
}

# Attach Policy to Role
resource "aws_iam_role_policy_attachment" "poller" {
  role       = aws_iam_role.poller.name
  policy_arn = aws_iam_policy.poller.arn
}

# IAM Role for Notifier
resource "aws_iam_role" "notifier" {
  name = "notifier-lambda-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Notifier
resource "aws_iam_policy" "notifier" {
  name   = "notifier-lambda-policy"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ],
        Effect   = "Allow",
        Resource = module.sqs.queue_arn
      },
      {
        Action   = [
          "secretsmanager:GetSecretValue"
        ],
        Effect   = "Allow",
        Resource = aws_secretsmanager_secret.pushover_user_key.arn
      },
      {
        Action   = [
          "secretsmanager:GetSecretValue"
        ],
        Effect   = "Allow",
        Resource = aws_secretsmanager_secret.pushover_api_token.arn
      }
    ]
  })
}

# Attach Policy to Role
resource "aws_iam_role_policy_attachment" "notifier" {
  role       = aws_iam_role.notifier.name
  policy_arn = aws_iam_policy.notifier.arn
}

# Secrets Manager
resource "aws_secretsmanager_secret" "finnhub_api_key" {
  name = "finnhub-api-key"
}

resource "aws_secretsmanager_secret_version" "finnhub_api_key" {
  secret_id     = aws_secretsmanager_secret.finnhub_api_key.id
  secret_string = "d1ojf3hr01quemd9d4hgd1ojf3hr01quemd9d4i0"
}

resource "aws_secretsmanager_secret" "pushover_user_key" {
  name = "pushover-user-key"
}

resource "aws_secretsmanager_secret_version" "pushover_user_key" {
  secret_id     = aws_secretsmanager_secret.pushover_user_key.id
  secret_string = "uynxirekzstkn5n5kpibanwubhe27o"
}

resource "aws_secretsmanager_secret" "pushover_api_token" {
  name = "pushover-api-token"
}

resource "aws_secretsmanager_secret_version" "pushover_api_token" {
  secret_id     = aws_secretsmanager_secret.pushover_api_token.id
  secret_string = "a545xhhzfxrypo3dhqityy6hbytk35"
}


# Lambda
module "poller_lambda" {
  source        = "../../modules/lambda"
  function_name = "stock-track-alert-poller-dev"
  image_uri     = "${aws_ecr_repository.poller.repository_url}:latest"
  iam_role_arn  = aws_iam_role.poller.arn
  environment_variables = {
    TABLE_NAME        = module.dynamodb.table_name
    QUEUE_URL         = module.sqs.queue_url
    FINNHUB_API_KEY = aws_secretsmanager_secret.finnhub_api_key.arn
  }
}

module "notifier_lambda" {
  source        = "../../modules/lambda"
  function_name = "stock-track-alert-notifier-dev"
  image_uri     = "${aws_ecr_repository.notifier.repository_url}:latest"
  iam_role_arn  = aws_iam_role.notifier.arn
  environment_variables = {
    PUSHOVER_USER_KEY  = aws_secretsmanager_secret.pushover_user_key.arn
    PUSHOVER_API_TOKEN = aws_secretsmanager_secret.pushover_api_token.arn
  }
}

# SQS Event Source Mapping
resource "aws_lambda_event_source_mapping" "this" {
  event_source_arn = module.sqs.queue_arn
  function_name    = module.notifier_lambda.function_arn
}

# EventBridge Scheduler
resource "aws_scheduler_schedule" "this" {
  name       = "stock-track-alert-poller-schedule-dev"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "rate(1 minute)"

  target {
    arn      = module.poller_lambda.function_arn
    role_arn = aws_iam_role.poller.arn
  }
}
