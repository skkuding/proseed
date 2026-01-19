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
