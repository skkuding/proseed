---
name: new-api
description: 백엔드 API 신규 구현 워크플로 — 요구사항 파악부터 브랜치/구현/검증/PR 생성까지. 사용자가 "API 만들어줘"라고 할 때 이 절차를 따른다.
---

# 백엔드 API 신규 구현 워크플로

사용자가 API 구현을 요청하면 아래 순서를 그대로 따른다. 각 단계의 산출물이 나오기 전에 다음 단계로 넘어가지 않는다.

## 0. 요구사항 파악

- 요청 출처(노션 회의록, 명세서, 대화)에서 **응답 필드·사용처·권한 요건**을 정확히 뽑는다.
- 민감 정보 노출 여부를 먼저 판단한다 (email, `ownedTicketCount` 등은 기본 제외).
- 모호하면 구현 전에 사용자에게 확인한다. 특히: **인증 정책**(공개/`@OptionalAuth`/인증 필수), unlock·보상 등 티켓 이코노미 관련 여부.
- `BACKEND_HANDOFF.md`에서 관련 P0/P1 항목·계약 불일치 노트를 확인한다.

## 1. 브랜치 생성

```bash
git checkout main && git pull --ff-only
git checkout -b feat/<kebab-case-이름>   # fix/, chore/, refactor/ 등 유형에 맞게
```

main에서 직접 작업 금지. 브랜치 이름은 PR 제목과 맞춘다.

## 2. 기존 컨벤션 미러링 (구현 전 필독)

- **컨트롤러**: 해당 모듈 컨트롤러 + `project.controller.ts` 참고.
  - 인증: 전역 가드 기본 ON. 공개 라우트는 `@Public()`, 세션 선택은 `@OptionalAuth()` (`src/auth/decorators/public.decorator.ts`).
  - Swagger: 인증 라우트에 `@ApiCookieAuth()` (라우트 단위 — 컨트롤러에 공개 라우트가 섞이면 클래스 레벨 금지), `@ApiTags('모듈명')`.
  - path param은 `@Param('x', ParseIntPipe)`.
- **서비스**: 예외는 `src/common/exceptions/business.exception.ts`의 `BusinessException` 계열 (`EntityNotExistException` 등) — Nest 내장 예외 대신 사용 (전역 필터가 HTTP로 변환).
  - 티켓 지급/차감·다중 쓰기는 `prisma.$transaction`.
  - S3 key는 DB 저장, 응답 시 presigned URL 변환 (`growth-record`의 `resolveImageUrls` 패턴).
- **DTO**: 요청 DTO는 class-validator (CLI 플러그인이 스키마 자동 추론), 응답 DTO는 **컨트롤러·서비스의 실제 반환 타입으로 사용** (`dto/*-response.dto.ts`). Prisma enum은 직접 import + `@ApiProperty({ enum: X, enumName: 'X' })`.
- **스키마 변경 시**: `pnpm --filter api exec prisma migrate dev --name <change>` → seed 영향 확인 (`prisma/seed.ts`).

## 3. 구현 + 단위 테스트

- 서비스 로직 테스트를 같은 폴더에 `*.service.spec.ts`로 추가. mocked prisma 패턴은 `growth-record-draft.service.spec.ts` 참고 (`new Service(prisma as unknown as PrismaService)`).
- 권한 매트릭스(공개/멤버/리드/외부인)와 404/409/422 경로를 최소 1개씩 커버.

## 4. 산출물 재생성 (라우트/DTO 변경 시 필수)

```bash
pnpm --filter web codegen:api   # openapi.json + apps/web/src/types/api.generated.ts 재생성
```

두 파일 모두 **커밋 대상**. main의 산출물이 stale할 수 있으니 diff에 남의 변경분이 섞여 들어오면 PR 본문에 명시.

## 5. bruno 요청 추가

- `bruno/<모듈>/` 아래 `.bru` 파일. 폴더가 없으면 `folder.bru`(다음 `seq` 번호, `auth { mode: inherit }`)와 함께 생성.
- `url: {{baseUrl}}/...`, `auth: inherit`, `docs` 블록에 권한 정책·에러 케이스 요약.

## 6. 검증 (전부 통과해야 커밋)

```bash
pnpm --filter api test
pnpm --filter web codegen:api        # 4번에서 안 돌렸으면 (build 포함)
pnpm lint && pnpm format:check       # format 실패 시 gitignore된 파일만인지 확인
```

**로컬 스모크 테스트** (docker 필요):

```bash
cd apps/api && docker compose up -d && pnpm exec prisma migrate deploy
# seed가 필요하면: pnpm exec prisma db seed  (계정 목록은 prisma/seed.ts 상단 주석, 비밀번호 proseed123!)
pkill -9 -f "dist/src/main.js"; lsof -ti :4100 | xargs kill -9 2>/dev/null  # 좀비 서버 정리
(set -a && source .env && set +a && PORT=4100 GOOGLE_CLIENT_ID="" GOOGLE_CLIENT_SECRET="" \
  KAKAO_CLIENT_ID="" KAKAO_CLIENT_SECRET="" NAVER_CLIENT_ID="" NAVER_CLIENT_SECRET="" \
  node dist/src/main.js > /tmp/proseed-api-smoke.log 2>&1 &)
```

- 성공 응답 + 에러 응답(401/404/400) + **기존 인증 라우트가 여전히 401인지** curl로 확인.
- 인증 필요한 라우트는 dev 로그인(`ENABLE_DEV_LOGIN=true`) 세션 쿠키로 테스트 (bruno `Auth/` 폴더 참고).
- 끝나면 `pkill -9 -f "dist/src/main.js"`.

## 7. 커밋

- Conventional Commits (commitlint 강제). 논리 단위로 분리 — 예: feat 커밋과 무관한 포맷 수정은 `style` 커밋으로 분리.
- pre-commit hook(lint-staged)이 eslint/prettier를 자동 적용하니 hook이 파일을 바꾸면 diff 재확인.

## 8. PR 생성

- **제목: 영어** Conventional Commits (`feat: ...` / `feat(api): ...`) — `pr-title.yml`이 검증.
- **본문: 한글**, `.github/pull_request_template.md` 구조 (`## 변경 사항` / `## 관련 이슈` / `## 스크린샷` / `## 테스트`).
  - 변경 사항: 라우트 시그니처, 권한 정책, 에러 코드, 산출물 재생성 여부 명시.
  - 테스트: 실행한 명령과 스모크 테스트 결과 기록.

```bash
git push -u origin <브랜치>
gh pr create --title "feat: ..." --body "..."
```

## 9. 후속 (요청받았을 때만)

- 노션 API 명세서 갱신 (skkuding 워크스페이스 "API 명세서" DB — 기존 페이지 형식 미러링, 초안 먼저 보여주고 승인 후 반영).
- 머지 후 bruno로 프로덕션 검증 (GET 요청만; mutation은 권한상 사용자 확인 필요).
