#!/usr/bin/env bash
# One-time GCP infrastructure setup for Cloud Run deployment.
# Usage: ./scripts/gcp-setup.sh [PROJECT_ID] [REGION]

set -euo pipefail

PROJECT_ID="${1:-valneetrivial}"
REGION="${2:-asia-south1}"
GITHUB_REPO="${GITHUB_REPO:-kashewknutt/laravelmix}"
PROJECT_NUMBER="${PROJECT_NUMBER:-4092394746}"
SERVICE_ACCOUNT="github-actions-deployer"
REPO="laravelmix"
POOL="github-pool"
PROVIDER="github-provider"

echo "==> Project: ${PROJECT_ID} (${PROJECT_NUMBER})"
echo "==> Region:  ${REGION}"
echo "==> GitHub:  ${GITHUB_REPO}"
echo ""

echo "==> Enabling required APIs"
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  --project "${PROJECT_ID}"

echo "==> Creating Artifact Registry repository"
gcloud artifacts repositories create "${REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --project="${PROJECT_ID}" \
  2>/dev/null || echo "Repository already exists"

echo "==> Creating service account"
gcloud iam service-accounts create "${SERVICE_ACCOUNT}" \
  --display-name="GitHub Actions Deployer" \
  --project="${PROJECT_ID}" \
  2>/dev/null || echo "Service account already exists"

SA_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --quiet
done

echo "==> Creating Workload Identity Pool"
gcloud iam workload-identity-pools create "${POOL}" \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --project="${PROJECT_ID}" \
  2>/dev/null || echo "Pool already exists"

ACTUAL_PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')

echo "==> Creating Workload Identity Provider for ${GITHUB_REPO}"
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER}" \
  --location="global" \
  --workload-identity-pool="${POOL}" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'" \
  --project="${PROJECT_ID}" \
  2>/dev/null || echo "Provider already exists"

gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${ACTUAL_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${GITHUB_REPO}" \
  --project="${PROJECT_ID}" \
  --quiet

WIF_PROVIDER="projects/${ACTUAL_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"

echo ""
echo "========================================"
echo "  GitHub Secrets (copy these exactly)"
echo "========================================"
echo ""
echo "Go to: https://github.com/${GITHUB_REPO}/settings/secrets/actions"
echo ""
echo "GCP_PROJECT_ID"
echo "  ${PROJECT_ID}"
echo ""
echo "GCP_REGION"
echo "  ${REGION}"
echo ""
echo "GCP_SERVICE_ACCOUNT"
echo "  ${SA_EMAIL}"
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "  ${WIF_PROVIDER}"
echo ""
echo "APP_KEY"
echo "  Run locally: php artisan key:generate --show"
echo ""
echo "========================================"
echo "  Next: push to main to trigger deploy"
echo "========================================"
