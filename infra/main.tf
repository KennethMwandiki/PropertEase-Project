terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.50.0"
    }
  }

  backend "gcs" {
    # This will be configured via `terraform init -backend-config="bucket=your-tf-state-bucket"`
    # as per the Cloud Shell workflow.
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

resource "google_project_service" "project_services" {
  for_each = toset([
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "cloudfunctions.googleapis.com",
    "secretmanager.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "compute.googleapis.com",
    "container.googleapis.com",
    "aiplatform.googleapis.com",
    "geocoding-backend.googleapis.com",
    "maps-backend.googleapis.com",
    "iamcredentials.googleapis.com",
  ])

  service                    = each.key
  disable_dependent_services = true
}

# Artifact Registry for Docker containers
resource "google_artifact_registry_repository" "main_repo" {
  project       = var.gcp_project_id
  location      = var.gcp_region
  repository_id = "propertease-repo"
  description   = "Docker repository for PropertEase services"
  format        = "DOCKER"
  depends_on = [
    google_project_service.project_services
  ]
}

# Cloud SQL for relational data (PostgreSQL)
resource "google_sql_database_instance" "main_db" {
  name             = "propertease-main-db"
  database_version = "POSTGRES_14"
  region           = var.gcp_region
  settings {
    tier = "db-g1-small"
  }
  deletion_protection = false # Set to true for production
  depends_on = [
    google_project_service.project_services
  ]
}

# Memorystore for caching (Redis)
resource "google_redis_instance" "cache" {
  name           = "propertease-cache"
  tier           = "BASIC"
  memory_size_gb = 1
  depends_on = [
    google_project_service.project_services
  ]
}