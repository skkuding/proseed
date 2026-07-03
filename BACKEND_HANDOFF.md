# Backend Handoff — 현재 상태 & 남은 작업

> 이 문서는 `CLAUDE.md`(아키텍처/명령/규약)를 보완하는 **현재 구현 상태 + 남은 백엔드 작업** 핸드오프다.
> 기준 커밋 `dd03b52` (2026-06-21). 아래 P0 항목은 실제 코드/스키마를 grep으로 검증한 결과다.
> 작업 시작 전 이 문서로 우선순위를 잡고, 끝나면 해당 항목 체크/갱신할 것.

## 한 줄 진단

프론트(`apps/web`)는 UI가 거의 완성이나 **대부분 mock 데이터**, 백엔드(`apps/api`)는 핵심 CRUD·버전 발행·채택·피드백 제출은 구현됐지만 **인증 가드 누락으로 인증 라우트가 사실상 전부 500**이고, **티켓 소모·마이페이지·피드백 조회 등 MVP 절반이 미구현**이다.

---

## 🚨 P0 — 즉시 수정 (지금 코드가 깨져 있음)

이걸 먼저 안 고치면 인증 라우트가 전부 죽어서 나머지 작업이 무의미하다.

- [ ] **1. 무가드 인증 라우트 → 500 크래시**
  - `apps/api/src/project/project.controller.ts`, `apps/api/src/growth-record/growth-record.controller.ts`(두 개의 `@Controller` 블록 모두)가 `req.user.id`를 읽지만 `@UseGuards(BetterAuthGuard)`가 없고, 전역 `APP_GUARD`도 없으며, 두 모듈이 `AuthModule`을 import하지도 않는다. (가드는 현재 `user.controller.ts` 3개 라우트 + `feedback.controller.ts` 컨트롤러 레벨에만 적용.)
  - 영향 라우트: `POST /project`, `GET /project/my`, `GET /project/:id`, `POST /project/:id/invite`, `POST /project/:id/versions`, `PATCH .../feedbacks/:feedbackId/adopt` → `Cannot read properties of undefined (reading 'id')` 500.
  - 권장: **전역 `APP_GUARD` + `@Public()` 데코레이터** 패턴 도입(공개 라우트만 opt-out: `GET /project`, `GET /project/:id/versions`, `GET /project/:id/versions/:versionId`, `GET /growth-records/feedback-templates`, `GET /health`, `/api/auth/*`). 또는 각 모듈에 `AuthModule` import + 라우트별 `@UseGuards`.
  - ⚠️ `GET /project/:id`는 `isMyProject` 때문에 **선택적 인증** 필요 — 비로그인 허용하되 세션 있으면 user 주입하는 가드 변형 필요.

- [ ] **2. 전역 `ValidationPipe` 미등록**
  - `apps/api/src/main.ts`에 `useGlobalPipes` 없음 → 모든 DTO의 `class-validator` 데코레이터(+ `FeedbackQuestionsPerCategoryConstraint`)가 **죽은 코드**. 실제 검증은 path param의 `ParseIntPipe`뿐.
  - 수정: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`. 활성화 후 생성 플로우 회귀 점검(transform으로 타입 바뀜).

- [ ] **3. 전역 예외 필터 미배선**
  - `apps/api/src/common/exceptions/business.exception.ts`의 `BusinessException`이 `HttpException`이 아니라 `Error`를 상속(`convert2HTTPException()` 보유하나 호출되는 곳 없음). `@Catch`/`APP_FILTER` 전무 → `EntityNotExist/ForbiddenAccess/ConflictFound/Duplicate/Unprocessable`가 의도한 404/403/409/422 대신 **전부 500**. (`UserService`만 Nest 내장 `NotFoundException` 써서 정상.)
  - 수정: `@Catch(BusinessException)` 필터를 `APP_FILTER`로 등록하거나, 예외들이 Nest `HttpException`을 상속하도록 변경.

- [ ] **4. Storage 엔드포인트 무인증**
  - `apps/api/src/storage/storage.controller.ts`의 `POST /storage/upload-url`, `GET /storage/download-url/*key`, `DELETE /storage/*key`에 가드 없음 → 누구나 업로드 URL 발급·**임의 객체 삭제** 가능. (DELETE가 특히 위험.)
  - 수정: 인증 필수 + 본인 업로드 key prefix만 허용.

- [ ] **5. `getProjectById` 이미지 presigned 변환 누락**
  - `apps/api/src/project/project.service.ts`가 `iconUrl`/`thumbnailUrl`/images를 **raw S3 key**로 반환(성장기록 이미지는 presigned 변환됨). 프론트가 못 쓰는 key를 받음.
  - 수정: 성장기록의 presigned 변환 패턴 재사용.

---

## 🟧 P1 — 핵심 미구현 (MVP 완성 필수)

- [ ] **1. 티켓 소모(피드백 까기/unlock)** — 서비스 핵심 메커니즘인데 **전무**.
  - `ownedTicketCount`는 `growth-record.service.ts`에서 **증가만** (버전 발행 시 팀원 +1, 채택 시 작성자 +3/+2). 차감 경로 0.
  - 추가: `FeedbackUnlock`(user × feedback × category) 모델 + `POST /feedbacks/:id/unlock {category}` (tx: `ownedTicketCount -=1` + Unlock 기록, 이미 열람이면 무과금, 잔액 부족 시 명확한 에러). 본문은 unlock + 멤버십 권한으로 게이팅(팀원은 티켓 소모 열람, 외부인은 **채택(공개)** 된 것만).

- [ ] **2. 피드백 조회 라우트 부재**
  - `apps/api/src/feedback/feedback.controller.ts`엔 `POST feedbacks` + `GET feedbackQuestions`만 있음. `GET .../versions/:versionId/feedbacks`(목록, 본문 게이팅)와 `GET /feedbacks/:feedbackId`(상세) 추가 필요 — 프로젝트 상세 피드백 탭의 전제.

- [ ] **3. 마이페이지 백엔드**
  - `GET/PATCH /me/profile`(skills/links/bio/jobType/nickname/profileImage 영속화 — 현재 온보딩이 jobType+name만 set), `GET /me/participated-projects`, `GET /me/feedbacks`(채택상태), `GET /me/tickets`(잔액+내역). 프론트는 이미 빈 배열/0으로 대기 중.

- [ ] **4. 프론트 미배선 연결**
  - `apps/web`의 피드백/성장기록 폼은 이미지만 업로드하고 **본문 제출 POST를 안 함**(성공 모달만). `GET /project/my`·`PATCH /project/:id`는 주석처리. 백엔드 POST는 (가드만 고치면) 준비됨 → 계약 맞추기.

- [ ] **5. 프로젝트 수정/삭제** — `PATCH /project/:id`(PM만, `update-project.dto.ts` 이미 존재하나 미사용), `DELETE /project/:id`.

- [ ] **6. base URL 통일** — `apps/web`이 storage·`POST /project`를 `http://localhost:4000`(/api 없이) 하드코딩, 나머지는 `NEXT_PUBLIC_API_URL`(…/api) 사용 → 일원화.

---

## 🟨 P2 / 이후

알림(`Notification` — 태그/채택 시, 티켓 지급 tx와 함께), 등급 승급 로직(`UserRole` 전환), 티켓 양도(2차), 북마크/좋아요/즐겨찾기, 사용자 검색(초대용 — 현재 프론트 `MOCK_USERS`), 최근 조회 프로젝트(Redis), 임시저장·팀장 권한, richer 마크다운(파일/이미지/코드). N차: AI 성장기록 요약 리포트.

---

## ❓ 구현 전 확정해야 할 명세 결정 (PM/기획 확인 필요)

세 명세(원본/보완본 v1/1차)와 디자인 보드가 **숫자/체계가 다름**. 코드에 박기 전 확정:

| 항목 | 후보 | 현재 코드 |
|---|---|---|
| 피드백 작성 보상 | +2 (원본) vs +1 (v1/1차) | **보상 없음** |
| 채택 보상 | 작성자 +3, 다직군 최대 +5 | +3/+2 차등(작성자·버전당 ~5) |
| 태그 보상 | 작성자 +1 + 알림 | **미구현** |
| 등급 게이팅 | 새싹→시더 승급 vs 전원 시더(0티켓) | `UserRole` enum만, 로직 없음 |
| 태그 한도 | 카테고리당 3 vs 무제한 | — |
| **카테고리 체계** | 코드 4종(PLAN/DESIGN/DEVELOPMENT/GENERAL) vs 디자인 5종(기획/디자인/**FE/BE**/기타) | enum 4종 |
| 상태 enum | `Hiring` vs `RECRUITING` | `Hiring` |
| 성장기록 수정 | 발행 후 immutable? | 수정 엔드포인트 없음 |
| 생성자/팀장 탈퇴 | 권한 위임 vs 프로젝트 삭제 | 미정 |

---

## 🔴 보안 (코드 외 즉시 조치)

- **OAuth client secret + `BETTER_AUTH_SECRET`이 팀 Notion("소셜 로그인 API Client ID & Secret" 페이지)에 평문 노출** → 즉시 **회전 + Notion에서 제거**, K8s SealedSecret로만 관리.
- 전역 throttling/rate-limit 없음.

---

## 따라야 할 코드 패턴 (기존 코드 미러링)

- **트랜잭션**: 티켓 지급·버전 발행·채택은 `prisma.$transaction` (race 방지). `growth-record.service.ts`의 `createVersion`/`adoptFeedback` 참고.
- **이미지**: "DB엔 S3 key, 읽을 때 presigned download URL" — 성장기록의 `resolveImageUrls` 패턴 재사용.
- **enum**: Prisma enum을 직접 import (DTO에서 재선언 금지 — 현재 `create-project.dto.ts`가 위반).
- **auth**: `BetterAuthGuard`가 주입한 `req.user.id`(number) 사용. 라우트는 `/api` 하위, better-auth는 `/api/auth`.
- **테스트**: 비즈니스 로직 테스트 전무 — 티켓 이코노미/채택 차등/검증부터 단위 테스트 추가 권장.

## 정리 거리 (저위험)

root `docker-compose.yaml`(미사용), `apps/ProSeed.sql`(실제 schema와 다른 옛 ERD), 미사용 deps(`@nestjs/jwt`·`@nestjs/passport`·`cache-manager`·`argon2`), `ProjectMemberRole.TeamLeader`(미사용), `ProjectVersion.releasedAt`(코드에서 미설정), `FeedbackQuestion`의 `title`/`content` 응답 shape 불일치.
