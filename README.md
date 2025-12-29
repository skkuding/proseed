# Morton

업체-기술자 연결 구인구직 플랫폼

## 기술 스택

| 영역     | 기술                      |
| -------- | ------------------------- |
| Frontend | NextJS, React, TypeScript |
| Styling  | Tailwind CSS              |
| State    | Zustand                   |
| Backend  | NestJS                    |
| Infra    | AWS, GitHub Actions       |

## 프로젝트 구조

```
proseed/
├── apps/
│   ├── web/              # NextJS 웹앱 (PWA)
│   └── api/              # NestJS API 서버
├── infra/
│   └── aws/              # AWS 인프라 코드
└── .github/workflows/    # CI/CD
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
