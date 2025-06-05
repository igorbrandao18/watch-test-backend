variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "watchme"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "app_port" {
  description = "Port exposed by the application"
  type        = number
  default     = 3000
}

variable "app_count" {
  description = "Number of application instances"
  type        = number
  default     = 2
}

variable "app_image" {
  description = "Docker image for the application"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "watchme"
}

variable "container_cpu" {
  description = "CPU para cada container (em unidades)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Memória para cada container (em MB)"
  type        = number
  default     = 512
}

variable "kafka_version" {
  description = "MSK Kafka version"
  type        = string
  default     = "2.8.1"
} 