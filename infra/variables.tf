variable "gcp_project_id" {
  description = "The GCP project ID to deploy resources into."
  type        = string
}

variable "gcp_region" {
  description = "The GCP region for resources."
  type        = string
  default     = "us-central1"
}

variable "tf_state_bucket" {
  description = "The name of the GCS bucket to store Terraform state."
  type        = string
}