variable "function_name" {
  type = string
}

variable "image_uri" {
  type = string
}

variable "iam_role_arn" {
  type = string
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  image_uri     = var.image_uri
  package_type  = "Image"
  role          = var.iam_role_arn
  timeout       = 60

  environment {
    variables = var.environment_variables
  }
}

output "function_arn" {
  value = aws_lambda_function.this.arn
}
