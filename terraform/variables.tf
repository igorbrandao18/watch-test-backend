variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "watchme"
}

variable "aws_region" {
  description = "Região AWS para deploy"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Username do banco de dados"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "app_port" {
  description = "Porta da aplicação"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Número desejado de instâncias da aplicação"
  type        = number
  default     = 2
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