output "artifact_registry_repository" {
  description = "The URI for the main Artifact Registry repository."
  value       = google_artifact_registry_repository.main_repo.name
}

output "cloud_sql_connection_name" {
  description = "The connection name for the main Cloud SQL instance."
  value       = google_sql_database_instance.main_db.connection_name
}

output "redis_host" {
  description = "The host IP for the Redis cache instance."
  value       = google_redis_instance.cache.host
}