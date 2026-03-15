# Proseed

사이드 프로젝트 및 포트폴리오 관리 웹앱

## 기술 스택

| 영역     | 기술                                  |
| -------- | ------------------------------------- |
| Frontend | Next.js 16, React 19, TypeScript      |
| Styling  | Tailwind CSS 4                        |
| State    | Zustand                               |
| Backend  | NestJS 11, Prisma, PostgreSQL         |
| Storage  | AWS S3 / MinIO (local)                |
| Infra    | Terraform, Kubernetes, GitHub Actions |

## 프로젝트 구조

```
proseed/
├── apps/
│   ├── web/              # Next.js 웹앱 (PWA)
│   └── api/              # NestJS API 서버
├── infra/
│   ├── aws/              # Terraform (RDS, S3, IAM)
│   └── k8s/              # Kubernetes manifests
└── .github/workflows/    # CI/CD
```

## 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   NestJS    │────▶│ PostgreSQL  │
│    (Web)    │     │    (API)    │     │    (RDS)    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  AWS S3 /   │
                   │   MinIO     │
                   └─────────────┘
```

### Backend

- **진입점**: `apps/api/src/main.ts` (OpenTelemetry 계측 포함)
- **환경변수 검증**: `apps/api/src/config/env.validation.ts` - 시작 시 필수 환경변수 검증 (fast fail)
- **데이터베이스**: Prisma ORM (`apps/api/prisma/schema.prisma`)
- **스토리지**: S3/MinIO presigned URL 방식 (`apps/api/src/storage/`)

### Frontend

- **App Router**: `apps/web/src/app/`
- **컴포넌트**: `apps/web/src/components/`
- **OpenTelemetry**: 서버/클라이언트 모두 계측

## 환경변수

API 서버 필수 환경변수 (`apps/api/.env.example` 참고):

| 변수                    | 설명                           | 예시                                               |
| ----------------------- | ------------------------------ | -------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL 연결 문자열         | `postgresql://user:pass@localhost:5432/proseed`    |
| `AWS_ACCESS_KEY_ID`     | S3/MinIO 액세스 키             | `minioadmin`                                       |
| `AWS_SECRET_ACCESS_KEY` | S3/MinIO 시크릿 키             | `minioadmin`                                       |
| `S3_BUCKET_NAME`        | 버킷 이름                      | `proseed-uploads`                                  |
| `S3_ENDPOINT`           | MinIO 엔드포인트 (로컬 개발용) | `http://localhost:9000` (AWS S3 사용 시 생략 가능) |

## 인프라

### AWS (Terraform)

`infra/aws/` 디렉토리에서 관리:

- **RDS**: PostgreSQL 데이터베이스
- **S3**: 파일 업로드 버킷 (`proseed-uploads`)
- **IAM**: API 서버용 사용자 및 정책
- **Route53**: DNS 관리

### Kubernetes

`infra/k8s/` 디렉토리에서 관리:

- **Kustomize** 기반 매니페스트
- **External Secrets Operator**: AWS Secrets Manager 연동
- **Reflector**: 네임스페이스 간 시크릿 복사
- **ArgoCD**: GitOps 배포

### CI/CD

GitHub Actions (`.github/workflows/`):

- `ci.yml`: PR 검증 (lint, format, build)
- `build-and-push.yaml`: Docker 이미지 빌드 후 GHCR 푸시

## 시작하기

```bash
# 의존성 설치
pnpm install

# Prisma 클라이언트 생성
pnpm --filter api prisma generate

# 개발 서버 실행
pnpm dev                        # Web (port 3000)
pnpm --filter api start:dev     # API (port 4000, docker compose 포함)
```

## 로컬 개발 서비스

`docker compose up -d` 실행 시:

| 서비스     | 포트 | 용도             |
| ---------- | ---- | ---------------- |
| PostgreSQL | 5434 | 데이터베이스     |
| MinIO API  | 9000 | S3 호환 스토리지 |
| MinIO 콘솔 | 9001 | MinIO 웹 UI      |

## 컨벤션

### 브랜치

- `main` - 프로덕션
- `feat/*` - 기능 개발
- `fix/*` - 버그 수정
- `docs/*` - 문서
- `chore/*` - 설정/빌드
- `refactor/*` - 리팩토링

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 사용

```
feat: 포트폴리오 업로드 기능 추가
fix: 이미지 리사이징 버그 수정
docs: README 업데이트
chore: ESLint 설정 변경
refactor: 인증 로직 개선
```

### 코드 스타일

- TypeScript strict 모드
- ESLint + Prettier 자동 포맷팅
- import 자동 정렬
- 컴포넌트: `UpperCamelCase.tsx`
- 유틸: `lowerCamelCase.ts`
