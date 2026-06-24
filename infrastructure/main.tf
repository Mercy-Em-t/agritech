terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1" # Nairobi Proximal Region
}

# ==========================================
# 1. NETWORK ISOLATION LAYER (VPC)
# ==========================================
resource "aws_vpc" "coinos_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "coinos-production-vpc"
    Environment = "production"
  }
}

# Private Subnets for Databases and MSK (No Direct Internet Access)
resource "aws_subnet" "private_subnet_a" {
  vpc_id            = aws_vpc.coinos_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-west-1a"
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.coinos_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "eu-west-1b"
}

# ==========================================
# 2. DATABASE LAYER (Aurora PostgreSQL Serverless v2)
# ==========================================
resource "aws_db_subnet_group" "aurora_subnet" {
  name       = "coinos-aurora-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
}

resource "aws_rds_cluster" "coinos_aurora" {
  cluster_identifier      = "coinos-aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"
  engine_version          = "15.3"
  database_name           = "coinos_core"
  master_username         = "coinos_admin"
  master_password         = "inject_via_aws_secrets_manager!"
  db_subnet_group_name    = aws_db_subnet_group.aurora_subnet.name
  skip_final_snapshot     = true

  serverlessv2_scaling_configuration {
    max_capacity = 64.0
    min_capacity = 0.5
  }
}

resource "aws_rds_cluster_instance" "coinos_aurora_instance" {
  cluster_identifier = aws_rds_cluster.coinos_aurora.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.coinos_aurora.engine
  engine_version     = aws_rds_cluster.coinos_aurora.engine_version
}

# ==========================================
# 3. EVENT BROKER LAYER (MSK Serverless Kafka)
# ==========================================
resource "aws_msk_serverless_cluster" "coinos_kafka" {
  cluster_name = "coinos-event-bus"

  vpc_config {
    subnet_ids         = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
    security_group_ids = [aws_security_group.kafka_sg.id]
  }

  client_authentication {
    sasl {
      iam {
        enabled = true
      }
    }
  }
}

resource "aws_security_group" "kafka_sg" {
  name        = "coinos-msk-sg"
  description = "Allow inbound Kafka traffic from ECS Tasks"
  vpc_id      = aws_vpc.coinos_vpc.id

  ingress {
    from_port   = 9098
    to_port     = 9098
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.coinos_vpc.cidr_block] # Restrict to VPC internal only
  }
}

# ==========================================
# 4. APPLICATION LAYER (ECS Fargate Cluster)
# ==========================================
resource "aws_ecs_cluster" "coinos_fargate_cluster" {
  name = "coinos-production-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# (Task Definitions and Load Balancers omitted for brevity, 
# but they attach the API and ML Docker Images to this ECS Cluster)
