# laravelmix — ACME Portfolio Demo on GCP


A full-stack **October CMS** project with a clean minimal **ACME Solutions** demo site, deployed to **Google Cloud Run** (Mumbai) via GitHub Actions.

Built by **[kashewknutt](https://github.com/kashewknutt)** · [Valnee Solutions](https://valnee.com)

## What is October CMS?

**October CMS** is a free, open-source content management system built on Laravel (PHP). It sits between WordPress and a custom Laravel app:

- **CMS** — edit pages and content via `/admin` without touching code
- **Twig templates** — developers build the front-end in `.htm` files (`layouts/`, `pages/`, `partials/`)
- **Your stack on top** — Tailwind CSS, Alpine.js, Laravel Mix

This repo is a **portfolio demonstration**: it proves you can design, build, and deploy a CMS-backed site with a modern front-end stack and automated CI/CD.

## Live demo

After setup, every push to `main` deploys to Cloud Run. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for setup instructions.

**Pages:**

| URL | Showcases |
|---|---|
| `/` | Hero, feature cards, Alpine tabs, fade-up animations |
| `/showcase` | Typography, buttons, cards, forms, animation gallery |
| `/about` | Two-column layout, timeline with staggered animations |
| `/contact` | Form with Alpine validation and success states |

## Stack

| Layer | Technology |
|---|---|
| CMS | October CMS 4 (Twig) |
| CSS | Tailwind CSS v2 + token-based design system |
| JS | Alpine.js v2 (bundled via Laravel Mix) |
| Build | Laravel Mix / webpack |
| Deploy | Docker → GCP Cloud Run (`asia-south1`) |
| CI/CD | GitHub Actions + Workload Identity Federation |

## Project structure

```
├── themes/laravelmix/          # ACME demo theme
│   ├── layouts/                # default + wide layouts
│   ├── pages/                  # home, showcase, about, contact
│   ├── partials/
│   │   ├── components/         # button, card, badge, stat, section-heading
│   │   └── site/               # header, footer, meta, scripts
│   ├── assets/src/             # CSS/JS source
│   └── assets/dist/            # compiled output
├── docker/                     # nginx + entrypoint
├── scripts/gcp-setup.sh        # one-time GCP setup
├── Dockerfile
├── .github/workflows/          # CI + deploy pipelines
└── docs/DEPLOYMENT.md          # step-by-step deploy guide
```

## Local development

### Requirements

PHP 8.2+, Composer, Node.js 20+

### Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
touch storage/database.sqlite
php artisan october:migrate

cd themes/laravelmix
npm install && npm run prod
cd ../..

php artisan serve
```

Visit **http://127.0.0.1:8000**. Active theme: `laravelmix` (set in `.env`).

### Hot-reload

```bash
# Terminal 1
php artisan serve

# Terminal 2
cd themes/laravelmix && npm run watch
```

Open **http://localhost:3000** for BrowserSync hot-reload.

## GCP deployment

Quick start:

```bash
gcloud auth login
gcloud config set project valneetrivial
./scripts/gcp-setup.sh
```

Add GitHub secrets (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)), then push to `main`.

| Setting | Value |
|---|---|
| Project | `valneetrivial` |
| Region | `asia-south1` |
| Repo | `kashewknutt/laravelmix` |

## Design system

Minimal token palette defined in `themes/laravelmix/tailwind.config.js`:

- **surface** — white, muted, subtle backgrounds
- **ink** — text hierarchy (default, muted, faint)
- **accent** — indigo primary action color

Reusable Twig partials in `partials/components/` act like UI components. Custom animations in `assets/src/css/extra.css`.

## Portfolio talking points

- Token-based design system with reusable Twig partials
- Alpine.js micro-interactions without a heavy JS framework
- Mobile-first responsive layouts across 4 demo pages
- Full CI/CD: GitHub → Docker → GCP Cloud Run in Mumbai
- October CMS for content-managed marketing sites

## License

MIT — see [LICENSE.md](LICENSE.md). Original TabulaRasa theme by [CJK.PL](https://cjk.pl).
