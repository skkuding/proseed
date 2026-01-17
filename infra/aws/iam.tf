resource "aws_iam_user" "github_actions" {
  name = "github-actions-ecr"
}

resource "aws_iam_user_policy" "github_actions_ecr" {
  name = "github-actions-ecr-policy"
  user = aws_iam_user.github_actions.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
          "ecr:BatchGetImage",
          "ecr:CreateRepository"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

output "github_actions_access_key_id" {
  value = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  value     = aws_iam_access_key.github_actions.secret
  sensitive = true
}

# IAM user for skkuding/lab repository to manage Route53 DNS records
resource "aws_iam_user" "lab_route53" {
  name = "skkuding-lab-route53"
}

resource "aws_iam_user_policy" "lab_route53" {
  name = "skkuding-lab-route53-policy"
  user = aws_iam_user.lab_route53.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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
        Effect   = "Allow"
        Action   = "route53:ListHostedZones"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_access_key" "lab_route53" {
  user = aws_iam_user.lab_route53.name
}

output "lab_route53_access_key_id" {
  value = aws_iam_access_key.lab_route53.id
}

output "lab_route53_secret_access_key" {
  value     = aws_iam_access_key.lab_route53.secret
  sensitive = true
}
