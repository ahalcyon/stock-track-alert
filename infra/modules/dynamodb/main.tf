variable "table_name" {
  type = string
}

resource "aws_dynamodb_table" "this" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "ticker"

  attribute {
    name = "ticker"
    type = "S"
  }
}

output "table_name" {
  value = aws_dynamodb_table.this.name
}

output "table_arn" {
  value = aws_dynamodb_table.this.arn
}
