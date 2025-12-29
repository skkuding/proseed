provider "aws" {
  region = "ap-northeast-2"
}

resource "aws_s3_bucket" "tfstate" {
  bucket = "proseed-terraform-state"

  # 실수로 버킷을 삭제하는 것을 방지
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "tfstate_versioning" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

# TODO: 도메인 구매 후 Route53 설정 추가
# resource "aws_route53_record" "root" {
# }
