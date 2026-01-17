# Route 53 Hosted Zone for proseednow.com
# Note: Import existing hosted zone with `terraform import aws_route53_zone.main <zone_id>`
resource "aws_route53_zone" "main" {
  name = "proseednow.com"

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  lab_cluster_ip = [
    "115.145.172.199", # server 10
  ]
}

resource "aws_route53_record" "root" {
  name    = "proseednow.com"
  zone_id = aws_route53_zone.main.zone_id
  type    = "A"
  records = local.lab_cluster_ip
  ttl     = 300
}

# OTEL Collector endpoint for client-side telemetry
# Points to the Kubernetes cluster's OTEL collector ingress
resource "aws_route53_record" "otel" {
  name    = "otel.proseednow.com"
  zone_id = aws_route53_zone.main.zone_id
  type    = "A"
  records = local.lab_cluster_ip
  ttl     = 300
}
