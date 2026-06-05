# GCP Deployment Guide

Deploy the ACME demo site to **Google Cloud Run** in Singapore (`asia-southeast1`) via GitHub Actions.

> **Why not Mumbai?** Cloud Run custom domain mapping is not supported in `asia-south1`. Singapore is the nearest region that supports it.

## Your project values

| Setting | Value |
|---|---|
| GitHub repo | [kashewknutt/laravelmix](https://github.com/kashewknutt/laravelmix) |
| GCP project ID | `valneetrivial` |
| GCP project number | `4092394746` |
| Region | `asia-southeast1` (Singapore) |
| Cloud Run service | `laravelmix-october` |

---

## Step 1 — Authenticate gcloud (local, one-time)

```bash
gcloud auth login
gcloud config set project valneetrivial
```

## Step 2 — Run infrastructure setup (local, one-time)

```bash
cd /path/to/laravelmix
./scripts/gcp-setup.sh
```

This enables APIs, creates Artifact Registry, service account, and Workload Identity Federation for GitHub Actions. Defaults are pre-filled for your project.

## Step 3 — Add GitHub Secrets (web UI)

Go to: **https://github.com/kashewknutt/laravelmix/settings/secrets/actions**

Click **New repository secret** for each:

| Secret name | Value |
|---|---|
| `GCP_PROJECT_ID` | `valneetrivial` |
| `GCP_REGION` | `asia-southeast1` |
| `GCP_SERVICE_ACCOUNT` | `github-actions-deployer@valneetrivial.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/4092394746/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `APP_KEY` | Output of `php artisan key:generate --show` (see below) |
| `APP_URL` | *(optional)* `https://laravelmix.valnee.com` — public custom domain; defaults to this if unset |

Deploy sets `APP_URL` on every push (no longer overwritten with the `.run.app` URL).

### Custom domain

| Setting | Value |
|---|---|
| Public URL | `https://laravelmix.valnee.com` |
| DNS | CNAME `laravelmix` → `ghs.googlehosted.com` |

After the domain mapping is **Active**, add optional secret `APP_URL=https://laravelmix.valnee.com` (or rely on the workflow default).

### Generate APP_KEY

Requires PHP 8.4+ and Composer:

```bash
composer install
cp .env.example .env
php artisan key:generate --show
```

Copy the full `base64:...` string into the `APP_KEY` secret.

## Step 4 — Push to deploy

```bash
git push origin main
```

Watch the deploy at: **https://github.com/kashewknutt/laravelmix/actions**

The **Deploy to GCP Cloud Run** workflow will:
1. Build theme assets inside Docker
2. Push image to Artifact Registry
3. Deploy to Cloud Run in `asia-southeast1`
4. Print the live URL in the job summary

## Step 5 — Verify in GCP Console (optional)

- **Cloud Run**: https://console.cloud.google.com/run?project=valneetrivial
- **Artifact Registry**: https://console.cloud.google.com/artifacts?project=valneetrivial
- Ensure billing is enabled on the project

---

## Local development (preview before deploy)

```bash
composer install
cp .env.example .env
php artisan key:generate
touch storage/database.sqlite
php artisan october:migrate

cd themes/laravelmix && npm install && npm run watch
# In another terminal:
php artisan serve
```

- **http://127.0.0.1:8000** — site preview
- **http://localhost:3000** — hot-reload (BrowserSync)
- **http://127.0.0.1:8000/admin** — October CMS admin

---

## Troubleshooting

### Deploy fails: "Permission denied" on Workload Identity

Re-run `./scripts/gcp-setup.sh` and verify the `GCP_WORKLOAD_IDENTITY_PROVIDER` secret matches exactly.

### Deploy fails: "failed to start and listen on port 8080"

Check Cloud Run logs. Common causes:

1. **PHP version mismatch** — Dockerfile must use PHP 8.4+ (October CMS 4 requirement).
2. **APP_KEY conflict** — Cloud Run sets `APP_KEY` as an env var; entrypoint must not run `key:generate` when it is already set. Fixed in `docker/entrypoint.sh`.
3. **Cache clear permissions** — startup runs `cache:clear` with `|| true` so a cold cache does not crash the container.

### Region still shows `asia-south1` in GitHub Actions

The workflow file hardcoded the region — changing the `GCP_REGION` secret alone had no effect. The workflow now reads `secrets.GCP_REGION` (defaults to `asia-southeast1`). Push the updated workflow, then re-run deploy.

When moving regions, create Artifact Registry in the new region once:

```bash
./scripts/gcp-setup.sh valneetrivial asia-southeast1
```

The old `asia-south1` Cloud Run service can be deleted from the GCP console when no longer needed.

### Site returns 500 — cache directory not writable

Cloud Run runs php-fpm as `www-data`. If `storage/` is owned by root, Laravel cannot create files under `storage/framework/cache/data/`. The entrypoint runs `chown -R www-data:www-data storage bootstrap/cache` after migrations. Redeploy with the latest `docker/entrypoint.sh`.

### Styles/JS blocked — mixed content

Cloud Run serves HTTPS but nginx→php-fpm is HTTP, so October generates `http://` asset URLs. Deploy sets `LINK_POLICY=secure` and `RELATIVE_LINKS=true`, and the app forces HTTPS in production. Redeploy after pulling the latest changes.

### Site loads but styles are missing

Theme assets are built inside Docker. Ensure `npm run prod` succeeds in CI. Check the Docker build logs in GitHub Actions.

### Admin login resets after redeploy

Expected with SQLite on Cloud Run (ephemeral storage). Front-end pages in Twig files are unaffected. For persistent admin, upgrade to Cloud SQL MySQL.

### Manual deploy (without GitHub Actions)

```bash
gcloud run deploy laravelmix-october \
  --source . \
  --project valneetrivial \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080
```

---

## Cost

- Cloud Run free tier covers light demo traffic (scales to zero when idle)
- Artifact Registry: pennies/month
- No Cloud SQL needed for SQLite demo
