# S3 bucket for daily on-premise PostgreSQL logical backups
resource "aws_s3_bucket" "postgres_backups" {
  bucket = "proseed-db-backups"
}

resource "aws_s3_bucket_public_access_block" "postgres_backups" {
  bucket = aws_s3_bucket.postgres_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "postgres_backups" {
  bucket = aws_s3_bucket.postgres_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "postgres_backups" {
  bucket = aws_s3_bucket.postgres_backups.id

  rule {
    id     = "expire-postgres-backups-after-seven-days"
    status = "Enabled"

    filter {}

    expiration {
      days = 7
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# Dedicated upload-only IAM identity for the Kubernetes backup CronJob
resource "aws_iam_user" "postgres_backup" {
  name = "proseed-postgres-backup"
}

resource "aws_iam_user_policy" "postgres_backup_put_object" {
  name = "proseed-postgres-backup-put-object"
  user = aws_iam_user.postgres_backup.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "PutPostgresBackupObjects"
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = ["${aws_s3_bucket.postgres_backups.arn}/postgres/*"]
      }
    ]
  })
}

resource "aws_iam_access_key" "postgres_backup" {
  user = aws_iam_user.postgres_backup.name
}

output "postgres_backups_bucket_name" {
  value = aws_s3_bucket.postgres_backups.bucket
}

output "postgres_backups_bucket_arn" {
  value = aws_s3_bucket.postgres_backups.arn
}

output "postgres_backup_access_key_id" {
  value     = aws_iam_access_key.postgres_backup.id
  sensitive = true
}

output "postgres_backup_secret_access_key" {
  value     = aws_iam_access_key.postgres_backup.secret
  sensitive = true
}
