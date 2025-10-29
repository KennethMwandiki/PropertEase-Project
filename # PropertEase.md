# PropertEase

This repository contains the source code for the PropertEase platform, a unified Cloud Shell–first DevOps and AI-powered architecture to connect property owners with buyers and renters seamlessly.

© 2025 Ken’s Digital Hub. All rights reserved.

## Vision

PropertEase empowers property owners to list spaces effortlessly and buyers/renters to discover, verify, and book with confidence. By combining a Google Cloud Shell–centric workflow with advanced AI services, we ensure rapid feature delivery, robust scalability, and hyper-personalized user experiences across all devices.

## Getting Started (Cloud Shell Workflow)

### 1. Clone Repositories

```bash
# Clone the infrastructure repo
git clone https://source.developers.google.com/projects/your-project/repos/infra

# Clone the application monorepo
git clone https://github.com/your-org/propertease.git
```

### 2. Provision Infrastructure

Navigate to the `infra` directory and use Terraform to create the necessary cloud resources.

```bash
cd propertease/infra

# You will be prompted to provide values for variables like project_id
terraform init -backend-config="bucket=your-tf-state-bucket-name"
terraform plan -out=tfplan
terraform apply "tfplan"
```

### 3. Develop Frontend

```bash
cd ../frontend
npm install
npm run dev
```