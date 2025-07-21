variable "queue_name" {
  type = string
}

variable "dead_letter_queue_name" {
  type = string
}

resource "aws_sqs_queue" "this" {
  name                       = var.queue_name
  redrive_policy             = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dead_letter_queue.arn,
    maxReceiveCount     = 4
  })
}

resource "aws_sqs_queue" "dead_letter_queue" {
  name = var.dead_letter_queue_name
}

output "queue_url" {
  value = aws_sqs_queue.this.id
}

output "queue_arn" {
  value = aws_sqs_queue.this.arn
}
