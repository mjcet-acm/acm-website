# Architecture Decision Record (ADR): Cloudflare & Zero-Cost Production Deployment

**Project**: MJCET ACM Student Chapter Website (`acm-website`)  
**Target Budget**: Strictly **$0.00 / month**  
**Core Technologies**: Next.js 16 (App Router, React 19) + Payload CMS 3.92 + PostgreSQL 16 + Cloudflare Ecosystem + Oracle Cloud Infrastructure (OCI)  
**Status**: Approved with Final Verification Conditions  
**Date**: November 2026  

---

## 1. Executive Summary & Problem Statement

The objective is to deploy the official **MJCET ACM Student Chapter** website into production under the following non-negotiable constraints:
1. **Domain & Routing**: Routed through Cloudflare (`acmmjcet.com`).
2. **Hosting Budget**: Strictly **$0.00 / month** recurring operational cost.
3. **Platform Strategy**: Maximize Cloudflare’s zero-cost edge capabilities (DNS, SSL, CDN, Tunnel, R2) while running the application runtime and database on verified free compute.
4. **Functionality Preservation**: Full retention of Next.js 16, Payload CMS 3.92, PostgreSQL relational schemas, authentication, plugins (SEO, Redirects, Forms, Search), and `sharp` media processing.
5. **Operational Rigor**: Realistic resource accounting, failure domain awareness, pinned dependencies, tested disaster recovery, and zero reliance on unverified workarounds.

---

## 2. Initial Codebase Audit

| Component | Current Implementation | Repository Reference |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.3 (React 19.2.6, Turbopack enabled) | [`package.json`](../package.json) |
| **CMS Engine** | Payload CMS 3.92.0 (Headless in App Router) | [`src/payload.config.ts`](../src/payload.config.ts) |
| **Database Adapter** | `@payloadcms/db-postgres` (PostgreSQL via Drizzle ORM) | [`src/payload.config.ts`](../src/payload.config.ts#L62-L66) |
| **Image Engine** | `sharp@0.35.4` (Native C++ `libvips` bindings) | [`package.json`](../package.json#L55) |
| **Media Variations** | Generates **7 responsive image sizes** per upload (`thumbnail`, `square`, `small`, `medium`, `large`, `xlarge`, `og`) | [`src/collections/Media.ts`](../src/collections/Media.ts#L47-L80) |
| **Storage Plugin** | `@payloadcms/storage-s3` (conditional Cloudflare R2 binding) | [`src/plugins/index.ts`](../src/plugins/index.ts#L95-L112) |
| **Containerization** | Multi-stage Alpine Dockerfile producing Next.js standalone output (`node server.js`) | [`Dockerfile`](../Dockerfile), [`next.config.ts`](../next.config.ts#L15) |

---

## 3. Historical Evaluation: Pure Cloudflare Workers Edge (`with-cloudflare-d1`)

We evaluated deploying the application completely serverless to Cloudflare Workers using Payload’s official [`templates/with-cloudflare-d1`](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1) template.

### 3.1 Clarifications on Bundle Size
* **The 1–3 MB Limit is Obsolete**: Cloudflare has updated Workers script size limits to **64 MiB uncompressed** across both Free and Paid tiers. The application bundle size itself is not the primary barrier when compiled via `@opennextjs/cloudflare`.

### 3.2 Verified Technical Limitations on Workers Free

Even with complete refactoring, deploying Payload CMS to the Cloudflare Workers **Free tier ($0)** fails due to fundamental platform constraints:

#### A. The 10 ms CPU Execution Limit (Error 1102)
* **Official Reference**: [Cloudflare Workers Limits — CPU Time](https://developers.cloudflare.com/workers/platform/limits/#cpu-time).
* **The Constraint**: The Free tier enforces a hard cap of **10 ms of active CPU execution time** per HTTP request.
* **The Reality**:
  * **Password Hashing**: Payload CMS uses cryptographic hashing (PBKDF2/WebCrypto) for authentication. Hashing consumes 50–100 ms of CPU compute. On Workers Free, creating an admin account or logging in aborts with **Error 1102: Worker exceeded resource limits** ([Payload GitHub Issue #18274](https://github.com/payloadcms/payload/issues/18274)).
  * **React 19 SSR**: Server-rendering dynamic pages with Lexical RichText AST traversal takes 15–40 ms of CPU compute.
  * **Paid Tier Comparison**: Workers Paid ($5/mo) extends CPU time to 30 seconds (up to 5 minutes).

#### B. Cloudflare D1 Lack of Real ACID Transactions
* **Documented Issue**: [Payload GitHub Issue #15219](https://github.com/payloadcms/payload/issues/15219).
* **The Constraint**: In `@payloadcms/db-d1-sqlite`, `beginTransaction()` is a **no-op** (`Promise.resolve(null)`). D1 drivers do not support atomic rollbacks across multi-statement asynchronous boundaries.
* **The Risk**: Payload handles updates to block fields and array relationships by issuing a `DELETE` followed by an `INSERT`. If an edge invocation is interrupted or times out midway, **data is permanently deleted with no rollback mechanism**.

#### C. D1 Query Parameter Ceiling
* **Documented Issues**: [Payload GitHub Issue #14766](https://github.com/payloadcms/payload/issues/14766) and [#18251](https://github.com/payloadcms/payload/issues/18251).
* **The Constraint**: Cloudflare D1 caps maximum bound SQL variables per statement. Complex documents with multiple blocks or drafts trigger `"too many SQL variables"` exceptions.

#### D. Native `sharp` Incompatibility
* **The Constraint**: Cloudflare Workers run inside V8 isolates (`workerd`) without a standard Linux userland. Native C++ modules (`libvips`) cannot execute.
* **The Impact**: Payload cannot generate responsive image variations. All 7 image variants configured in `Media.ts` must be stripped, or Cloudflare Images must be purchased ($5/month minimum).

> [!NOTE]
> **Conclusion**: The official Payload CMS documentation and template maintainers explicitly state that deploying the full CMS to Cloudflare Workers **mandates a Paid Workers plan ($5/month)**.

---

## 4. Compute & Database Platform: OCI Always Free

To achieve a true **$0.00/month** cost without edge CPU killswitches or transactional compromises, the backend runs on Oracle Cloud Infrastructure (OCI) Always Free resources.

### 4.1 Resource Disclaimers & Accurate Capacity Accounting

* **Accurate CPU Accounting**:
  Each `VM.Standard.E2.1.Micro` instance provides:
  * **1/8th OCPU** baseline allocation (burstable AMD EPYC core).
  * **1 GB RAM**.
  * Up to **50 Mbps network bandwidth**.
  * **Two instances provide 1/4 OCPU baseline allocation and 2 GB total RAM**, not two dedicated vCPUs.
* **Provisioning Feasibility Check**:
  While AMD Micro instances have significantly higher availability than ARM Ampere instances, Oracle explicitly documents temporary "Out of host capacity" errors during regional surges. **Step 1 of the implementation is verifying that both instances can be provisioned in your home region before completing configuration.**

### 4.2 Multi-VM Architecture & Network Isolation

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          ORACLE CLOUD VIRTUAL CLOUD NETWORK (VCN)                      │
│                                                                                        │
│   ┌──────────────────────────────────────────┐  Private Subnet (10.0.1.0/24)           │
│   │               VM 1: APP HOST             │                                         │
│   │  • 1/8 OCPU baseline, 1 GB RAM           │  Encrypted internal DB connection       │
│   │  • Next.js 16 + Payload 3.92 Container   │───────────────────────────────────┐     │
│   │  • cloudflared Tunnel Daemon (~25 MB)    │                                   │     │
│   │  • Initial Resource Limit: 512 MB RAM    │                                   │     │
│   │  • 4 GB Swapfile on NVMe Block Storage   │                                   │     │
│   └──────────────────────────────────────────┘                                   │     │
│                         │ Outbound only                                          ▼     │
│                         ▼ (Tunnel to Cloudflare)        ┌───────────────────────────┐  │
│                                                         │         VM 2: DB HOST     │  │
│                                                         │  • 1/8 OCPU, 1 GB RAM     │  │
│                                                         │  • PostgreSQL 16 Alpine   │  │
│                                                         │  • Strictly NO public port│  │
│                                                         │  • Tuned for 1 GB RAM     │  │
│                                                         │  • Nightly backup runner  │  │
│                                                         │  • 4 GB Swapfile          │  │
│                                                         └─────────────┬─────────────┘  │
│                                                                       │                │
└───────────────────────────────────────────────────────────────────────┼────────────────┘
                                                                        ▼
                                                         ┌────────────────────────────┐
                                                         │     OCI OBJECT STORAGE     │
                                                         │ (Tenancy Quota / Backups)  │
                                                         └────────────────────────────┘
```

* **VM 1 (App Host)**: Runs Next.js, Payload CMS, and the Cloudflare Tunnel daemon.
* **VM 2 (Database Host)**: Runs PostgreSQL 16. **PostgreSQL port 5432 is strictly bound to the private VCN subnet (`10.0.1.x`) and is completely unexposed to the public internet.**
* **Outbound Egress Routing**:
  * Verify whether your VCN uses a **NAT Gateway** or a **Public Subnet with an Internet Gateway and strict Security Lists** (zero open inbound ports, stateful outbound traffic allowed). An Internet Gateway route table has zero extra service fees, whereas NAT configurations must be verified in the OCI tenancy dashboard.
  * For database backups, OCI **Service Gateway** provides direct, zero-cost access to OCI Object Storage without traversing public internet paths.

### 4.3 Realistic Memory Accounting & Tuning for 1 GB RAM

Running on 1 GB of physical RAM requires strict memory controls:

#### A. PostgreSQL Memory Tuning (`postgresql.conf` on VM 2)
Conservative parameters prevent PostgreSQL from exhausting system memory:
```ini
# Memory Configuration for 1 GB RAM Host
shared_buffers = 128MB          # 1/8th of physical RAM
work_mem = 4MB                  # Per-operation sort/hash memory
maintenance_work_mem = 32MB     # VACUUM and index maintenance
effective_cache_size = 384MB    # Planner estimate
max_connections = 25            # Conservative connection cap (prevents connection spikes)
```
*(Connection poolers like PgBouncer should only be introduced if connection metrics justify their additional memory footprint).*

#### B. Application Runtime & Sharp Concurrency Control (VM 1)
* **Initial Container Memory Cap**: Start with a conservative **512 MB** limit in `compose.prod.yaml` to leave ample headroom for the Linux OS, systemd, and the `cloudflared` daemon. Increase only after empirical load testing:
  ```env
  NODE_OPTIONS="--max-old-space-size=400"
  ```
* **Sharp Concurrency Control**: By default, `sharp` spawns worker threads matching CPU count. On constrained instances, restrict concurrency in code to prevent image resizing spikes from exhausting memory:
  ```ts
  import sharp from 'sharp'
  sharp.concurrency(1)
  sharp.cache(false)
  ```
* **Swap Space**: Each VM must configure a **4 GB swapfile** on its NVMe block volume (`/swapfile`) as an emergency buffer against memory pressure, not as treated physical RAM.

### 4.4 Compilation Architecture: External GitHub Actions CI/CD

Compiling Next.js 16 + Payload CMS requires 2.5 GB – 4.0 GB of RAM and will trigger the Linux OOM Killer on a 1 GB instance.

* **GitHub Actions Runner Configuration**:
  * **Private Repositories**: Standard GitHub Actions runners provide **2 vCPUs and 7 GB of RAM** with **2,000 free minutes/month**.
  * **Public Repositories**: Up to 4 vCPUs and 16 GB of RAM.
  * **Design Rule**: The multi-stage Docker build is configured to build cleanly within standard 2-core / 7 GB limits.
  * **Corepack Activation**: Dockerfile explicitly prepares pnpm 11 (`corepack enable pnpm && corepack prepare pnpm@11.8.0 --activate`) to prevent Alpine build resolution issues.
* **Registry**: Container images are pushed to and pulled from **GitHub Container Registry (`ghcr.io`)**, which offers free storage and bandwidth for public/standard repositories.
* **Deployment Pattern**: The VM **never compiles code**. It exclusively executes:
  ```bash
  docker compose pull && docker compose up -d
  ```

### 4.5 Architecture Topology: Dual-VM vs. Single-VM Fallback
* **Primary (Dual-VM)**: VM 1 (App Host) and VM 2 (DB Host) separated over private VCN. Offers maximum memory headroom (~500 MB on App, ~900 MB on DB), but introduces two independent failure domains.
* **Experimental Fallback (Single-VM All-in-One)**: If inter-VCN latency or multi-VM management proves cumbersome, both PostgreSQL and Next.js could run on VM 1, leaving VM 2 as an isolated staging server or cold standby.

> [!WARNING]
> **Unverified Memory Estimate**: The ~535 MB combined runtime figure is a theoretical baseline and has not been demonstrated under realistic conditions. PostgreSQL, Next.js, `sharp`, Docker overhead, and `cloudflared` can all experience concurrent memory spikes during media uploads, SSR bursts, and database maintenance (VACUUM, index rebuilds). A 512 MB application container cap does not establish that the combined system will fit within 1 GB. **This layout must be benchmarked under concurrent requests, media uploads, and database activity before it can be selected as a production configuration.**

### 4.6 The OCI Reclamation Policy: Operational Reality

> [!IMPORTANT]
> **Removal of Artificial Heartbeats**: Oracle’s official reclamation policy evaluates 7-day percentiles across CPU, network, and memory utilization. Artificial CPU heartbeat scripts do not guarantee exemption and create synthetic noise.

**The True Mitigation Strategy**:
1. **Infrastructure As Code**: Documented shell/provisioning scripts to reconstruct the VM environment in under 15 minutes.
2. **Stateless App Host**: VM 1 holds zero persistent state; it can be reprovisioned instantly by pulling the latest image from GHCR.
3. **Automated Database Backups & Tested Restoration**: Nightly database dumps shipped off-server with verified restoration procedures.

---

## 5. The Cloudflare Edge Layer

Cloudflare provides ingress security, performance acceleration, and media storage:

### 5.1 Cloudflare DNS & Universal SSL (Traffic Path Architecture)
* **Anycast DNS**: Global sub-10ms DNS resolution.
* **Two-Legged SSL Architecture**:
  * **Leg 1 (Browser $\rightarrow$ Cloudflare Edge)**: Encrypted via Cloudflare Universal SSL. All visitors communicate exclusively over HTTPS.
  * **Leg 2 (Cloudflare Edge $\rightarrow$ Tunnel Daemon $\rightarrow$ Next.js)**: The `cloudflared` daemon maintains an outbound TLS tunnel over port 7844 / QUIC to Cloudflare Edge. On the VM internal network, `cloudflared` forwards requests to `http://app:3000` over local HTTP.
  * **Edge Encryption Setting**: Because Cloudflare Tunnel handles origin connectivity through its own secure protocol rather than traditional public origin IP fetching, the Cloudflare dashboard SSL mode must not introduce origin HTTPS enforcement between `cloudflared` and the local port, avoiding redirect loops (`ERR_TOO_MANY_REDIRECTS`). The Next.js application receives `x-forwarded-proto: https` from the tunnel.

### 5.2 Explicit Edge Caching & ISR Invalidation Verification
By default, Cloudflare caches static assets based on file extensions.

* **Public Static Assets** (`/_next/static/*`, `/public/*`): Explicitly set long-term cache headers:
  ```http
  Cache-Control: public, max-age=31536000, immutable
  ```
* **Dynamic Frontend Pages** (`/`, `/events`, `/posts`, `/team`): Managed via Next.js ISR.
* **Integration Lifecycle Verification**: Verify the full content publishing cycle before production sign-off:
  1. Publish a new event/post in Payload admin.
  2. Confirm it renders on the public site.
  3. Edit and update the document.
  4. Verify the cached edge page revalidates (`stale-while-revalidate`).
  5. Unpublish the document and confirm it returns 404 / removal from archives.
* **Protected & Authenticated Endpoints** (`/admin/*`, `/api/*`): Enforce strict no-cache headers to prevent edge exposure of sensitive or user-specific data:
  ```http
  Cache-Control: private, no-cache, no-store, must-revalidate
  ```

### 5.3 Cloudflare Tunnel (`cloudflared`) & Server Actions Origin Validation
* Operates outbound-only over TLS to Cloudflare edge data centers.
* Eliminates open ports (80/443/5432) on the VM firewall.
* Configure `originRequest.httpHostHeader: acmmjcet.com` in Tunnel settings.
* **Server Actions Origin Guard**: Next.js Server Actions perform specific origin validation on POST requests. Whitelist `'acmmjcet.com'` under `experimental.serverActions.allowedOrigins` in [`next.config.ts`](../next.config.ts) specifically to satisfy this Server Action origin check (not as a general-purpose proxy header override).
* Resource footprint: ~25 MB RAM.

### 5.4 Cloudflare R2 Media Storage
* S3-compatible object storage with **10 GB free monthly storage**, **1M write operations**, **10M read operations**, and **zero egress fees**.
* Integrated via `@payloadcms/storage-s3` in [`src/plugins/index.ts`](../src/plugins/index.ts).
* Configured with `generateFileURL` pointing to a dedicated custom media domain (e.g., `media.acmmjcet.com`) registered in Next.js `remotePatterns` and `forcePathStyle: true`.

---

## 6. Operational Hardening & Edge Cases

### 6.1 Next.js Build-Time Variable Inlining
* `NEXT_PUBLIC_SERVER_URL` is statically inlined during `docker build`.
* In CI/CD, pass `--build-arg NEXT_PUBLIC_SERVER_URL=https://acmmjcet.com` so production URLs resolve properly in OpenGraph tags and sitemaps.

### 6.2 Hardened PostgreSQL Backup & Tested Restoration Runbook
* Non-TTY execution, custom-format (`-Fc`) archives for granular `pg_restore`, pipeline failure guards, and **authenticated encryption** using [`age`](https://github.com/FiloSottile/age):

> [!NOTE]
> **Why `age` instead of `openssl enc`?** OpenSSL's `enc` command does not support authenticated encryption modes (GCM, CCM). The `-aes-256-gcm` flag silently falls back to unauthenticated CBC or fails entirely depending on the OpenSSL version. `age` provides authenticated encryption by default with a simpler interface and no risk of misconfiguration.

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="/tmp/acm_website_$(date +%F_%H%M%S).dump"
ENCRYPTED_FILE="${BACKUP_FILE}.age"
BACKUP_RECIPIENT_FILE="/etc/acm/backup_recipient.pub" # age public key (safe to store openly)

# 1. Custom-format dump via non-interactive exec (without -t to prevent PTY mangling)
docker exec postgres-container pg_dump -U postgres -d acm_website -Fc > "${BACKUP_FILE}"

# 2. Authenticated encryption with age (recipient public key)
age -R "${BACKUP_RECIPIENT_FILE}" -o "${ENCRYPTED_FILE}" "${BACKUP_FILE}"

# 3. Stream to OCI Object Storage via Service Gateway / CLI
oci os object put --bucket-name acm-db-backups --file "${ENCRYPTED_FILE}" --name "$(basename "${ENCRYPTED_FILE}")"

# Cleanup local temp
rm -f "${BACKUP_FILE}" "${ENCRYPTED_FILE}"
```
* **Tested Restoration Procedure (Streamed Input via stdin)**:
```bash
# Decrypt archive (identity file at mode 0400, strictly inaccessible to other users)
age -d -i /etc/acm/backup_identity.key backup.dump.age > backup.dump

# Non-interactive restore streamed from host through stdin (archive does NOT reside in container)
cat backup.dump | docker exec -i postgres-container pg_restore -U postgres -d acm_website_restore_test --clean --if-exists -
```

> [!IMPORTANT]
> **Key Management**: The identity file (`backup_identity.key`) is the only way to decrypt backups. Store a recovery copy in a separate secure location (e.g., a password manager or offline storage). Losing the identity means losing access to all encrypted backups.

### 6.3 Explicit Transactional Email Limits (Resend)
* Oracle Cloud blocks outbound port 25. All emails must route via HTTPS API (port 443).
* **Resend Free Tier Quotas**:
  * **3,000 emails / month**.
  * **Strict limit of 100 emails / day**.
  * Operational Rule: Email notifications for contact forms and password resets must be monitored against the 100/day threshold.

### 6.4 Image Pinning, Enforced Memory Limits & CI/CD Deployment Safeties
* **Image Pinning**: Pinned base image (`FROM node:22.23.4-alpine AS base`).
* **CI/CD Concurrency Locking**: In `.github/workflows/deploy.yml`, configure concurrency groups to prevent race conditions during deployments:
  ```yaml
  concurrency:
    group: production_deployment
    cancel-in-progress: false
  ```
* **Sequential Release & Readiness Gate**:
  1. Pull new Docker image (`ghcr.io/mjcet-acm/acm-website:${{ github.sha }}`).
  2. Execute controlled database migrations:
     ```bash
     docker compose run --rm app pnpm payload migrate
     ```
  3. Start container with image tag.
  4. Wait for Readiness probe (`/api/health?type=readiness`) to report green before marking deployment successful.
  5. Never execute automated migration rollbacks unless explicitly designed and verified as reversible.
* **Instant Container Rollback**:
  ```bash
  IMAGE_TAG=previous_working_sha docker compose up -d
  ```
* **Enforced Container Memory Limits (Compose Standalone Compatible)**:
  Use top-level `mem_limit` to guarantee enforcement across both standalone Docker Compose and Swarm engines:
  ```yaml
  services:
    app:
      restart: unless-stopped
      mem_limit: 512m
      healthcheck:
        test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health?type=liveness"]
        interval: 30s
        timeout: 5s
        retries: 3
        start_period: 40s
  ```
  *Verify enforcement on the VM via*: `docker inspect <container_id> --format '{{.HostConfig.Memory}}'` (Must return `536870912`).

---

## 7. Financial Ledger: Published Free Quotas vs. Tenancy Verification

| Provider | Service | Published Free Quota | Tenancy Verification Requirement | Verified Monthly Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare** | DNS & Universal SSL | Unlimited | Bound to 1 Custom Domain | **$0.00** |
| **Cloudflare** | Edge CDN & WAF | Unlimited standard caching | Standard proxying | **$0.00** |
| **Cloudflare** | Cloudflare Tunnel | Up to 50 users (Zero Trust) | Free tier entitlement | **$0.00** |
| **Cloudflare** | R2 Object Storage | 10 GB storage, $0 egress | Bucket created in dashboard | **$0.00** |
| **Oracle Cloud** | 2x AMD Micro VMs | 1/4 OCPU, 2 GB RAM total | **Must verify capacity in home region AD** | **$0.00** |
| **Oracle Cloud** | NVMe Block Storage | 200 GB total allocation | **Must verify block volume quota in tenancy** | **$0.00** |
| **Oracle Cloud** | Outbound Bandwidth | 10 TB / month | Standard global allowance | **$0.00** |
| **Oracle Cloud** | Object Storage | 20 GB standard storage | **Subject to tenancy quota / eligibility** | **$0.00** |
| **GitHub** | Actions & GHCR | 2,000 min/mo (Private) / Unlimited (Public) | Verify repository visibility setting | **$0.00** |
| **Resend** | Transactional Email API | 3,000/mo (Max 100/day) | Free API key in dashboard | **$0.00** |
| **TOTAL** | — | — | — | **$0.00 / month** |

---

## 8. Verified Rollout Roadmap

Implementation proceeds in disciplined stages:

```
[Phase 1: OCI Feasibility] ──► [Phase 2: Database First] ──► [Phase 3: App Benchmark]
  • Account eligibility        • PostgreSQL 16 on VM 2        • External GitHub Actions build
  • Provision 2 AMD VMs        • Tune memory (128MB shared)   • Benchmark on 1 GB VM (512MB cap)
  • Egress routing check       • -Fc backup & restore drill   • Restrict sharp concurrency

[Phase 4: Cloudflare Setup] ──► [Phase 5: Media & Email] ──► [Phase 6: Acceptance]
  • Cloudflare Tunnel daemon     • R2 bucket & custom domain    • ISR publish/invalidate cycle
  • Full (Strict) SSL            • Resend 100/day check         • Readiness health checks
  • allowedOrigins CSRF fix      • next.config remotePatterns   • Concurrency lock & rollback drill
```

1. **Step 1: OCI Feasibility**: Confirm tenancy quotas and provision both instances.
2. **Step 2: Database Layer**: Deploy PostgreSQL with 128 MB `shared_buffers`, private subnet binding, and execute the encrypted `-Fc` backup/restore test.
3. **Step 3: Application & Benchmarking**: Deploy Next.js container with 512 MB initial memory limit, verify `sharp` sequential processing, and monitor resident memory.
4. **Step 4: Cloudflare Edge & Tunnel**: Deploy `cloudflared`, configure `httpHostHeader`, set SSL to Full (Strict), and whitelist origin headers.
5. **Step 5: Media & Email**: Verify R2 image uploads with `generateFileURL` and test Resend API.
6. **Step 6: Acceptance**: Run the complete ISR publish-update-unpublish verification and deployment rollback drill.
