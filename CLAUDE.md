# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proseed - 사이드 프로젝트 및 포트폴리오 관리 웹앱

Monorepo with pnpm workspaces:

- `apps/web` - Next.js 16 frontend (React 19, TypeScript, Tailwind CSS 4)
- `apps/api` - NestJS 11 backend (Prisma, PostgreSQL, S3/MinIO)
- `infra/aws` - Terraform for AWS (RDS, S3, IAM, Route53)
- `infra/k8s` - Kubernetes manifests (Kustomize)

## Common Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client (required before running API)
pnpm --filter api prisma generate

# Development
pnpm dev                        # Web dev server (port 3000)
pnpm --filter api start:dev     # API dev server (port 4000, includes docker compose up)

# Build
pnpm build                      # Build web
pnpm --filter api build         # Build API

# Lint & Format
pnpm lint                       # ESLint
pnpm format                     # Prettier write
pnpm format:check               # Prettier check

# Test (API only)
pnpm --filter api test          # Unit tests
pnpm --filter api test:watch    # Watch mode
pnpm --filter api test:e2e      # E2E tests
```

## Architecture

### Backend (NestJS)

- **Entry point**: `apps/api/src/main.ts` with OpenTelemetry instrumentation
- **Config validation**: `apps/api/src/config/env.validation.ts` - validates required env vars at startup (fast fail)
- **Database**: Prisma ORM with schema at `apps/api/prisma/schema.prisma`
- **Storage**: S3/MinIO integration in `apps/api/src/storage/` with presigned URLs

### Frontend (Next.js)

- **App Router**: `apps/web/src/app/`
- **Components**: `apps/web/src/components/`
- **OpenTelemetry**: Both server (`instrumentation.ts`) and client (`instrumentation-client.ts`)

### Infrastructure

- **Terraform**: `infra/aws/` - RDS, S3 bucket, IAM policies, Route53
- **Kubernetes**: `infra/k8s/` - Deployments use Kustomize, secrets via External Secrets Operator and Reflector
- **CI/CD**: GitHub Actions builds Docker images, pushes to GHCR

## Environment Variables

API requires (see `apps/api/.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - S3/MinIO credentials
- `S3_BUCKET_NAME` - Bucket name
- `S3_ENDPOINT` - Optional, set for MinIO (local dev)

## Conventions

- **Commits**: Conventional Commits (enforced by commitlint)
- **Branches**: `main` (prod), `feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`
- **TypeScript**: Strict mode
- **File naming**: Components `UpperCamelCase.tsx`, utils `lowerCamelCase.ts`
