# laravelmix — October CMS on GCP

Full-stack October CMS project with the **laravelmix** theme (Twig, Tailwind CSS, Alpine.js, Laravel Mix), deployed to **Google Cloud Run** via GitHub Actions.

Maintained by **kashewknutt**. Theme based on [TabulaRasa](https://github.com/cjkpl/oc-tabularas-theme) by CJK.PL.

## Project structure

```
├── app/                    # October CMS application
├── config/                 # October CMS config
├── themes/laravelmix/      # Custom theme (Twig + Tailwind + Alpine)
│   ├── layouts/
│   ├── pages/
│   ├── partials/
│   ├── assets/src/         # Source CSS/JS
│   ├── assets/dist/        # Compiled assets (built by Mix)
│   ├── webpack.mix.js
│   └── package.json
├── docker/                 # Container config (nginx, entrypoint)
├── scripts/gcp-setup.sh    # One-time GCP infrastructure setup
├── Dockerfile              # Production image for Cloud Run
└── .github/workflows/      # CI/CD pipelines
```

## Stack

| Layer | Technology |
|---|---|
| CMS | October CMS 4 (Twig templates) |
| CSS | Tailwind CSS v2 |
| JS | Alpine.js v2 (bundled via Laravel Mix) |
| Build | Laravel Mix / webpack |
| Deploy | Docker → GCP Cloud Run |

## Local development

### Requirements

- PHP 8.2+
- Composer
- Node.js 20+
- SQLite (default) or MySQL

### Setup

```bash
# Install October CMS dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Create SQLite database
mkdir -p storage
touch storage/database.sqlite
php artisan october:migrate

# Build theme assets
cd themes/laravelmix
npm install
npm run prod
cd ../..

# Run dev server
php artisan serve
```

Visit **http://127.0.0.1:8000**. Backend: **http://127.0.0.1:8000/admin**.

The active theme is set via `ACTIVE_THEME=laravelmix` in `.env`.

### Theme hot-reload

```bash
# Terminal 1
php artisan serve

# Terminal 2
cd themes/laravelmix && npm run watch
```

Open **http://localhost:3000** (BrowserSync proxies October).

## GCP deployment (CI/CD)

Deployment is fully automated via GitHub Actions on push to `main`.

### One-time GCP setup

```bash
# Install gcloud CLI, authenticate, then:
GITHUB_REPO=your-github-user/laravelmix ./scripts/gcp-setup.sh YOUR_PROJECT_ID us-central1
```

This creates:
- Artifact Registry repository (`laravelmix`)
- Service account for GitHub Actions
- Workload Identity Federation (no long-lived keys)

### GitHub secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `GCP_PROJECT_ID` | Your GCP project ID |
| `GCP_REGION` | e.g. `us-central1` |
| `GCP_SERVICE_ACCOUNT` | `github-actions-deployer@PROJECT.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output from setup script |
| `APP_KEY` | Run `php artisan key:generate --show` locally and paste the value |

### Deploy

Push to `main` — GitHub Actions will:

1. Build theme assets inside Docker
2. Install PHP dependencies via Composer
3. Push image to Artifact Registry
4. Deploy to Cloud Run

Manual deploy:

```bash
gcloud run deploy laravelmix-october \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Production database

The default Docker setup uses **SQLite** (fine for demos). Cloud Run storage is ephemeral — SQLite data resets on redeploy.

For production, use **Cloud SQL (MySQL)**:

1. Create a Cloud SQL instance
2. Connect Cloud Run to Cloud SQL
3. Set env vars on the Cloud Run service:

```
DB_CONNECTION=mysql
DB_HOST=/cloudsql/PROJECT:REGION:INSTANCE
DB_DATABASE=october
DB_USERNAME=october
DB_PASSWORD=your-password
```

Update the deploy workflow or set these in the GCP Console.

## CI

Pull requests and pushes to `main` run:

- **build-theme** — `npm run prod` in `themes/laravelmix/`
- **build-docker** — validates the Docker image builds

## Theme development

Edit templates in `themes/laravelmix/`. After CSS/JS changes:

```bash
cd themes/laravelmix
npm run prod    # production build
npm run watch   # development with hot-reload
```

Colors and fonts: `themes/laravelmix/tailwind.config.js`

## License

MIT — see [LICENSE.md](LICENSE.md). Original TabulaRasa theme by [CJK.PL](https://cjk.pl). Adapted by **kashewknutt**.
