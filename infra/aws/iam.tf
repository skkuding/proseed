# Unified IAM user for proseed project (Route53, Secrets Manager, S3, etc.)
resource "aws_iam_user" "proseed" {
  name = "proseed"
}

resource "aws_iam_user_policy" "proseed" {
  name = "proseed-policy"
  user = aws_iam_user.proseed.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Route53
      {
        Effect = "Allow"
        Action = [
          "route53:GetHostedZone",
          "route53:ListResourceRecordSets",
          "route53:ChangeResourceRecordSets",
          "route53:GetChange"
        ]
        Resource = [
          aws_route53_zone.main.arn,
          "arn:aws:route53:::change/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:ListHostedZonesByName"
        ]
        Resource = "*"
      },
      # Secrets Manager
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "arn:aws:secretsmanager:ap-northeast-2:548484840497:secret:rds!*",
          "arn:aws:secretsmanager:ap-northeast-2:548484840497:secret:proseed/*"
        ]
      },
      # S3 (for future use)
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::proseed-*",
          "arn:aws:s3:::proseed-*/*"
        ]
      }
    ]
  })
}

resource "aws_iam_access_key" "proseed" {
  user = aws_iam_user.proseed.name
}

output "proseed_access_key_id" {
  value = aws_iam_access_key.proseed.id
}

output "proseed_secret_access_key" {
  value     = aws_iam_access_key.proseed.secret
  sensitive = true
}
