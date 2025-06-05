terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC and Network Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "watchme-vpc"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "watchme-cluster"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "watchme-app"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 256
  memory                  = 512

  container_definitions = jsonencode([
    {
      name  = "watchme-api"
      image = "${aws_ecr_repository.app.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/watchme-api"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECR Repository
resource "aws_ecr_repository" "app" {
  name = "watchme-api"
}

# ElastiCache (Redis)
resource "aws_elasticache_cluster" "cache" {
  cluster_id           = "watchme-cache"
  engine              = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  port                = 6379
}

# RDS (PostgreSQL)
resource "aws_db_instance" "db" {
  identifier           = "watchme-db"
  engine              = "postgres"
  engine_version      = "15"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  storage_type        = "gp2"
  
  username            = "postgres"
  password            = "postgres"  # Em produção, usar secrets manager
  
  skip_final_snapshot = true
}

# SQS Queue
resource "aws_sqs_queue" "events" {
  name = "watchme-events"
} 