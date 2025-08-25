terraform {
  required_version = ">= 1.6.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 5.8.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ---------- R2 ----------
resource "cloudflare_r2_bucket" "assets" {
  account_id = var.account_id
  name       = var.r2_name
}

# ---------- Worker (with R2, AI) ----------
resource "cloudflare_workers_script" "app" {
  account_id         = var.account_id
  script_name        = var.worker_name
  main_module        = "index.js"
  content_file       = "${path.module}/worker/index.js"
  content_sha256     = filesha256("${path.module}/worker/index.js")
  compatibility_date = "2025-08-01"

  # Bindings: R2 bucket, Workers AI
  bindings = [
    {
      name        = "ASSETS"
      type        = "r2_bucket"
      bucket_name = cloudflare_r2_bucket.assets.name
    },
    {
      name = "AI"
      type = "ai"
    },
    {
      name = "rag_json"
      type = "plain_text"
      text = "rag_index.json"
    }
  ]
}


# Enable [worker].[your_domain].workers.dev
resource "cloudflare_workers_script_subdomain" "app_workers_dev" {
  account_id  = var.account_id
  script_name = cloudflare_workers_script.app.script_name
  enabled     = true
}
