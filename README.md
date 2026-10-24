# MJCET ACM Student Chapter Website

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.92-blue?style=flat-square&logo=payloadcms)](https://payloadcms.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-S3_Compatible-F38020?style=flat-square&logo=cloudflare)](https://www.cloudflare.com/products/r2/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

Official web portal for the **ACM Student Chapter** at **Muffakham Jah College of Engineering and Technology (MJCET)**, Hyderabad. Built with a modern, decoupled, content-driven architecture featuring Next.js App Router, Payload CMS, PostgreSQL, and Cloudflare R2 storage.

---

## 🌟 Architecture & Tech Stack

```
                          [ Client / Browser ]
                                   │
                                   ▼
                       [ Cloudflare CDN & DNS ]
                                   │
                                   ▼
             [ Next.js 16 App Router + Payload CMS 3.92 ]
                 ├── Frontend Pages & Dynamic Blocks
                 └── Headless Admin Dashboard (/admin)
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       [ PostgreSQL Database ]         [ Cloudflare R2 Storage ]
         (Tables, Users, Posts)          (S3-compatible Media/Assets)
```

- **Frontend & Server**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **CMS / Headless Backend**: [Payload CMS 3.x](https://payloadcms.com/) natively integrated within Next.js
- **Database**: [PostgreSQL](https://www.postgresql.org/) via `@payloadcms/db-postgres`
- **Media Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/) via `@payloadcms/storage-s3` (with local filesystem fallback for development)
- **Styling**: Tailwind CSS v4 + Radix UI / shadcn/ui primitives
- **Package Manager**: [pnpm](https://pnpm.io/) v11
- **Containerization & Deployment**: Docker (standalone multi-stage build) on Coolify / Oracle Cloud Infrastructure (OCI)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: `v22.x` or `v24.x`
- **pnpm**: `v9`, `v10`, or `v11`
- **Docker**: For running the local PostgreSQL service

### 2. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/mjcet-acm/acm-website.git
cd acm-website

# Copy the example environment variables
cp .env.example .env
```

Ensure `.env` contains your local database configuration:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/acm_website
PAYLOAD_SECRET=your_super_secret_payload_key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Start PostgreSQL with Docker

```bash
docker compose up -d postgres
```
*(The local database is mapped to port `5433` on the host to avoid system port `5432` collisions).*

### 4. Install Dependencies and Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit:
- **Frontend**: [http://localhost:3000](http://localhost:3000) (or `3001` if 3000 is occupied)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

Follow the on-screen instructions on `/admin` to register your initial administrator account.

---

## 📂 Project Structure

```
├── .agents/              # Agent skills and customizations
├── public/               # Static assets & public files
├── src/
│   ├── app/
│   │   ├── (frontend)/   # Next.js App Router customer-facing routes & layouts
│   │   └── (payload)/    # Payload CMS admin routes & API endpoints
│   ├── blocks/           # Reusable layout building blocks (Hero, Content, Media, Archive, CTA)
│   ├── collections/      # Payload CMS collection definitions (Pages, Posts, Categories, Media, Users)
│   ├── components/       # UI components (Header, Footer, Cards, Links, Buttons)
│   ├── fields/           # Reusable schema fields (Lexical rich text, links, slugs)
│   ├── globals/          # Global configs (Header and Footer navigation)
│   ├── heros/            # Hero variations (HighImpact, MediumImpact, LowImpact)
│   ├── plugins/          # Payload plugins (SEO, Redirects, Cloudflare R2 storage)
│   ├── utilities/        # Helper utilities (URL formatters, OpenGraph mergers)
│   └── payload.config.ts # Core Payload CMS configuration
├── docker-compose.yml    # Local PostgreSQL service definition
├── Dockerfile            # Multi-stage production container build
├── next.config.ts        # Next.js configuration (standalone output enabled)
└── package.json          # Scripts and project dependencies
```

---

## ☁️ Deployment (OCI + Coolify + Cloudflare R2)

This repository is pre-configured for automated, zero-downtime deployment using **Coolify** on **Oracle Cloud Infrastructure (OCI)**:

1. **Standalone Output**: `output: 'standalone'` is enabled in `next.config.ts` for minimal Docker image sizes.
2. **PostgreSQL**: Connect your Coolify-managed PostgreSQL database by setting the `DATABASE_URL` environment variable.
3. **Cloudflare R2**: To enable Cloudflare R2 for zero-egress asset storage, provide the following variables in your production environment:
   ```env
   R2_BUCKET=acm-website-media
   R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   ```
   *If these variables are omitted, Payload automatically falls back to local disk storage.*

---

## 🛠️ Common Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js and Payload development server |
| `pnpm build` | Compiles the production build with standalone output |
| `pnpm start` | Runs the compiled production server |
| `pnpm payload generate:types` | Regenerates TypeScript definitions from CMS collections |
| `pnpm payload generate:importmap` | Updates the admin component import map |
| `pnpm lint` | Runs ESLint across the codebase |

---

## 🤝 Contributing

Contributions from chapter members and student developers are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📬 Contact & Connect

**MJCET ACM Student Chapter**  
Muffakham Jah College of Engineering and Technology  
Mount Pleasant, 8-2-249 to 267, Road No. 3, Banjara Hills, Hyderabad, Telangana 500034  

- **Website**: [acm.mjcet.ac.in](https://acm.mjcet.ac.in)
- **GitHub**: [@mjcet-acm](https://github.com/mjcet-acm)
- **Instagram**: [@mjcetacm](https://instagram.com/mjcetacm)
- **LinkedIn**: [MJCET ACM Student Chapter](https://linkedin.com/company/mjcetacm)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
