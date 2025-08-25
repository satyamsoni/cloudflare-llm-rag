variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "account_id" { 
	type = string
}
variable "worker_name"   { 
	type = string
	default = "llm-worker"
}
variable "r2_name" { 
	type = string 
	default = "llm-storage"
}
variable "workers_dev_subdomain" {
  type = string
}