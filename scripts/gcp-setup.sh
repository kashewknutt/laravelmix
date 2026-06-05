#!/usr/bin/env bash
# One-time GCP infrastructure setup for Cloud Run deployment.
# Usage: ./scripts/gcp-setup.sh PROJECT_ID REGION

set -euo pipefail

PROJECT_ID="${1:?Usage: $0 PROJECT_ID REGION}"
REGION="${2:?Usage: $0 PROJECT_ID REGION}"
SERVICE_ACCOUNT="github-actions-deployer"
REPO="laravelmix"
POOL="github-pool"
PROVIDER="github-provider"
GITHUB_REPO="${GITHUB_REPO:-}"

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

PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')

if [ -n "${GITHUB_REPO}" ]; then
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
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${GITHUB_REPO}" \
    --project="${PROJECT_ID}" \
    --quiet
fi

echo ""
echo "=== Add these GitHub repository secrets ==="
echo "GCP_PROJECT_ID=${PROJECT_ID}"
echo "GCP_REGION=${REGION}"
echo "GCP_SERVICE_ACCOUNT=${SA_EMAIL}"
echo "GCP_WORKLOAD_IDENTITY_PROVIDER=projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"
echo ""
echo "Set GITHUB_REPO=owner/repo when running this script to configure Workload Identity Federation:"
echo "  GITHUB_REPO=owner/repo ./scripts/gcp-setup.sh ${PROJECT_ID} ${REGION}"
