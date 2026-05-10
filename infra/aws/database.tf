# RDS PostgreSQL Database for Proseed API

# Use default VPC
data "aws_vpc" "default" {
  default = true
}

# Get default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "proseed-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "proseed-db-subnet-group"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "proseed-rds-sg"
  description = "Security group for Proseed RDS PostgreSQL"
  vpc_id      = data.aws_vpc.default.id

  # Allow PostgreSQL from lab cluster IP only
  ingress {
    description = "PostgreSQL from lab cluster"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [for ip in local.lab_cluster_ip : "${ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "proseed-rds-sg"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "proseed-database"

  # Engine
  engine         = "postgres"
  engine_version = "16"

  # Instance
  instance_class = "db.t3.micro"

  # Storage (gp2 for free tier)
  allocated_storage = 20
  storage_type      = "gp2"

  # Database
  db_name  = "skkuding"
  username = "postgres"

  # Auto-generate password and store in Secrets Manager
  manage_master_user_password = true

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true

  # Backup
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Settings
  skip_final_snapshot = true
  deletion_protection = false # Set to true after testing

  tags = {
    Name = "proseed-database"
  }
}

# Note: RDS automatically creates a secret in Secrets Manager with manage_master_user_password = true
# The secret ARN is available via aws_db_instance.main.master_user_secret[0].secret_arn
# Secret contains: username, password

# Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "rds_master_user_secret_arn" {
  description = "ARN of the RDS master user secret in Secrets Manager"
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
}
