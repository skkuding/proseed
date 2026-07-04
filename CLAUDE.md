# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proseed — 사이드 프로젝트 및 포트폴리오 관리 웹앱. pnpm workspaces 모노레포, Node 24.

- `apps/web` — Next.js 16 (App Router, React 19, Tailwind 4, Zustand, MDX editor)
- `apps/api` — NestJS 11 (Prisma 6, Better-Auth, S3/MinIO)
- `infra/aws` — Terraform (S3, IAM, Route53)
- `infra/k8s` — Kustomize: `api/`, `postgres/` (on-premise pod), `web/`, `web-preview/` (per-PR), `web-preview-infra/`

웹/API 모두 OpenTelemetry로 계측 (server + client).

## Common Commands

```bash
pnpm install

# Prisma client는 API 실행 전 반드시 1회 생성
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma migrate dev --name <change>   # 스키마 변경 시
pnpm --filter api exec prisma db seed                       # 로컬 시드 (계정/데이터 목록은 prisma/seed.ts 상단 주석)

# Dev
pnpm dev                          # Web (port 3000)
pnpm --filter api start:dev       # API (port 4000) — docker compose up -d 자동 실행

# Build (root에 build 스크립트 없음 — 워크스페이스별 호출)
pnpm --filter web build           # Web
pnpm --filter api build           # API

# Lint / Format
pnpm lint                         # ESLint
pnpm format                       # Prettier write
pnpm format:check                 # CI에서 사용

# Test (API only)
pnpm --filter api test            # Jest
pnpm --filter api test:e2e        # E2E (test/jest-e2e.json)
pnpm --filter api test -- <pattern>   # 단일 파일/패턴
```

Husky pre-commit hook이 변경된 파일에 ESLint, Prettier, `prisma format`을 자동 적용 (root `package.json`의 `lint-staged`).

## Architecture

### Backend (`apps/api/src/`)

- **OTel 계측**: `main.ts`의 `bootstrap()`이 `OTEL_EXPORTER_OTLP_ENDPOINT` 설정 시에만 `Instrumentation.start()` 호출 (Nest app 부팅 직전)
- **Env validation** (`config/env.validation.ts`): `class-validator`로 부팅 시 fail-fast. OAuth credentials는 `@ValidateIf(isProduction)` 패턴으로 **production에서만 강제** — 로컬은 비워둬도 부팅됨
- **Auth** (`auth/better-auth.service.ts`): `better-auth`를 Prisma adapter로 래핑. `databaseHooks.user.create.before`에서 신규 가입자에게 `@woowa-babble/random-nickname` 닉네임을 자동 부여 (Prisma `User.name`이 NOT NULL이라 필수). Social: Google / Kakao / Naver
- **모듈** (`app.module.ts`): `Prisma`, `Storage`, `Auth`, `User`, `Project`, `GrowthRecord`, `Feedback`
- **DB** (`prisma/schema.prisma`): PostgreSQL. 모든 컬럼/테이블 snake_case 매핑 (`@map`, `@@map`)
- **Storage** (`storage/`): S3/MinIO presigned URL 방식. `S3_ENDPOINT`가 설정되면 MinIO 모드
- **Health** (`health.controller.ts`): K8s liveness/readiness용

### Frontend (`apps/web/src/`)

- **App Router** (`app/`): `mainpage/`, `mypage/`, `myproject/`, `projects/`, `navigate/`, `mdxEditor/`, `api/`
- **라우트 비공개 디렉토리** (`app/_components/`, `app/_utils/`, `app/_mockdata/`): underscore prefix로 라우팅 제외
- **글로벌 컴포넌트** `components/`, **Zustand store** `store/`, **유틸** `lib/`

### Infrastructure

- **Terraform** (`infra/aws/`): S3 (`object-storage.tf`), IAM (`iam.tf`), Route53 (`dns.tf`)
- **K8s** (`infra/k8s/`): Kustomize 기반. 시크릿은 SealedSecrets + Reflector로 namespace 간 복제. RDS 대신 on-premise Postgres pod (`postgres/deployment.yaml`). DB 마이그레이션은 K8s Job (`api/migration.yaml`)으로 배포 시 실행
- **PR Preview**: `apps/web/**` 변경 시 `.github/workflows/preview-build.yaml`이 브랜치별 이미지를 GHCR에 빌드 → `web-preview/` overlay로 배포. cleanup은 `preview-cleanup.yaml`
- **CI** (`.github/workflows/ci.yml`): Node 24, `pnpm install --frozen-lockfile` → `prisma generate` → lint → format:check → build. PR title은 `pr-title.yml`로 Conventional Commits 검증

## Environment Variables (API)

`apps/api/.env.example` 참조. 필수:

- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- `BETTER_AUTH_SECRET` — `openssl rand -base64 32`로 생성
- `BETTER_AUTH_URL` — `getOrThrow` 사용 (validation은 optional이지만 runtime은 required). 로컬은 `http://localhost:3000`, 프로덕션은 K8s configmap 주입
- **Production 한정**: `{GOOGLE,KAKAO,NAVER}_CLIENT_{ID,SECRET}`

선택:

- `AWS_REGION` (기본 `ap-northeast-2`)
- `S3_ENDPOINT` — 설정 시 MinIO 모드
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `ENABLE_DEV_LOGIN` — `true`면 seed 유저 email/password 로그인 허용 (**로컬 전용**, 프로덕션 설정에 넣지 말 것)

## Local Services

`pnpm --filter api start:dev`는 `cwd=apps/api`에서 `docker compose up -d`를 실행하므로 `apps/api/docker-compose.yml`을 사용. (root의 `docker-compose.yaml`은 어떤 스크립트도 참조하지 않는 unused 잔재 — 별도 PR로 삭제 권고)

| 서비스     | 포트 | 자격증명                            | 자동 셋업                                       |
| ---------- | ---- | ----------------------------------- | ----------------------------------------------- |
| PostgreSQL | 5432 | `proseed` / `proseed`, db=`proseed` | -                                               |
| MinIO API  | 9000 | `minioadmin` / `minioadmin`         | `proseed-uploads` 버킷 자동 생성 (`minio-init`) |
| MinIO 콘솔 | 9001 | (위와 동일)                         | -                                               |

`apps/api/.env.example`의 기본값(`proseed:proseed@localhost:5432/proseed`, `minioadmin`)이 이 docker-compose와 일치하므로 그대로 복사해서 쓰면 된다.

## Conventions

- **Commits**: Conventional Commits (commitlint enforced, PR title 포함)
- **Branches**: `main` (prod), `feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`
- **TypeScript**: strict
- **File naming**: 컴포넌트 `UpperCamelCase.tsx`, 유틸 `lowerCamelCase.ts`

## Current Status & Remaining Backend Work

현재 구현 상태와 남은 백엔드 작업(P0 즉시 수정 / P1 핵심 미구현 / 명세 결정 대기)은 별도 핸드오프 문서에 정리돼 있다. **백엔드 작업 시작 전 반드시 확인**할 것:

@BACKEND_HANDOFF.md
