resource "aws_s3_bucket" "tfstate" {
  bucket = "stock-track-alert-tfstate"
}

resource "aws_dynamodb_table" "tfstate_lock" {
  name         = "stock-track-alert-tfstate-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
