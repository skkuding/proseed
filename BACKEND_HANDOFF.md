# Backend Handoff — 현재 상태 & 남은 작업

> 이 문서는 `CLAUDE.md`(아키텍처/명령/규약)를 보완하는 **현재 구현 상태 + 남은 백엔드 작업** 핸드오프다.
> 기준 커밋 `d839236` (2026-06-29). 2026-07-03에 전 항목을 실제 코드/스키마와 대조 재검증 완료 (P0 1~5 전부 유효).
> 작업 시작 전 이 문서로 우선순위를 잡고, 끝나면 해당 항목 체크/갱신할 것.

## 한 줄 진단

프론트(`apps/web`)는 UI가 거의 완성이나 **대부분 mock 데이터**. 백엔드는 2026-07-03 기준 **전역 가드·ValidationPipe·예외 필터 배선 완료**, **성장기록 발행(태그=채택 + 티켓 정산 포함) 구현 완료**. 남은 핵심: **티켓 소모(unlock)·피드백 조회·마이페이지·프론트 배선**.

---

## 🚨 P0 — 즉시 수정 (1~3 완료, 4 부분 완료 — 2026-07-03)

- [x] **1. 무가드 인증 라우트 → 500 크래시** — ✅ **해결 (2026-07-03)**: `AuthModule`에 `APP_GUARD`로 `BetterAuthGuard` 전역 등록 + `@Public()`/`@OptionalAuth()` 데코레이터(`src/auth/decorators/public.decorator.ts`) 도입. 공개 라우트: `GET /project`, `GET /project/:id/versions`, `GET .../versions/:versionId`, `GET /growth-records/feedback-templates`, `GET /health`, `GET /storage/health`, `GET /`. `GET /project/:id`는 `@OptionalAuth()`로 비로그인 허용(세션 있으면 `req.user` 주입). 로컬 가드(`user`/`feedback` 컨트롤러)는 제거하고 전역으로 일원화. 스모크 테스트로 401/404/200 확인 완료.

- [x] **2. 전역 `ValidationPipe` 미등록** — ✅ **해결 (2026-07-03)**: `main.ts`에 `ValidationPipe({ whitelist: true, transform: true })` 등록. `FeedbackQuestionsPerCategoryConstraint`는 4개 직군 전부 필수(각 1~4개)로 확장, 서비스의 중복 구현(`validateFeedbackQuestionsPerCategory`) 제거. `GetProjectsDto` 쿼리 검증(400) 스모크 확인 완료.

- [x] **3. 전역 예외 필터 미배선** — ✅ **해결 (2026-07-03)**: `src/common/filters/business-exception.filter.ts`의 `@Catch(BusinessException)` 필터를 `APP_FILTER`로 등록 (`convert2HTTPException()` 활용). 404/409 응답 스모크 확인 완료.

- [ ] **4. Storage 엔드포인트 무인증** — 🔶 **부분 해결 (2026-07-03)**: 전역 가드로 `upload-url`/`download-url`/`DELETE` 인증 필수화 완료 (`GET /storage/health`만 `@Public`), `GetUploadUrlDto`에 검증 추가.
  - 남은 것: **본인 업로드 key prefix 정책** (현재는 인증만 하면 임의 key 삭제 가능).

- [ ] **5. `getProjectById` 이미지 presigned 변환 누락**
  - `apps/api/src/project/project.service.ts`가 `iconUrl`/`thumbnailUrl`/images를 **raw S3 key**로 반환(성장기록 이미지는 presigned 변환됨). 프론트가 못 쓰는 key를 받음.
  - 수정: 성장기록의 presigned 변환 패턴 재사용.

---

## 🟧 P1 — 핵심 미구현 (MVP 완성 필수)

- [ ] **1. 티켓 소모(피드백 까기/unlock)** — 서비스 핵심 메커니즘인데 **전무**.
  - `ownedTicketCount`는 `growth-record.service.ts`에서 **증가만** (버전 발행 시 팀원 +1, 태그=채택 시 작성자 +3/+5). 차감 경로 0.
  - 추가: `FeedbackUnlock` 모델 + `POST .../unlock` (tx: `ownedTicketCount -=1` + Unlock 기록, 이미 열람이면 무과금, 잔액 부족 시 명확한 에러). 본문은 unlock + 멤버십 권한으로 게이팅(팀원은 티켓 소모 열람, 외부인은 **채택(공개)** 된 것만). ⚠️ unlock 단위(제출×직군 vs 피드백×직군)는 FE 카드 구조(제출×직군)에 맞춰 구현 전 확정할 것.

- [ ] **2. 피드백 조회 라우트 부재**
  - `apps/api/src/feedback/feedback.controller.ts`엔 `POST feedbacks` + `GET feedbackQuestions`만 있음. `GET .../versions/:versionId/feedbacks`(목록, 본문 게이팅)와 `GET /feedbacks/:feedbackId`(상세) 추가 필요 — 프로젝트 상세 피드백 탭의 전제.

- [ ] **3. 마이페이지 백엔드**
  - `GET/PATCH /me/profile`(skills/links/bio/jobType/nickname/profileImage 영속화 — 현재 온보딩이 jobType+name만 set), `GET /me/participated-projects`, `GET /me/feedbacks`(채택상태), `GET /me/tickets`(잔액+내역). 프론트는 이미 빈 배열/0으로 대기 중.

- [ ] **4. 프론트 미배선 연결**
  - `apps/web`의 피드백/성장기록 폼은 이미지만 업로드하고 **본문 제출 POST를 안 함**(성공 모달만). 성장기록은 3-스텝 플로우(작성 폼 → 목표/결과 모달 → 피드백 질문 폼)의 마지막 "프로젝트 업데이트" 버튼도 POST 없음. `GET /project/my`·`PATCH /project/:id`는 주석처리. 백엔드 POST는 (가드만 고치면) 준비됨 → 계약 맞추기(아래 "FE↔BE 계약 불일치" 참조).
  - ⚠️ `GrowthRecordForm.tsx`는 presigned 업로드 후 응답에서 `url`만 쓰고 **`key`를 버림** → 배선 시 imageKeys를 백엔드로 못 보냄. (`FeedbackForm.tsx`는 key 보관함.)

- [ ] **5. 프로젝트 수정/삭제** — `PATCH /project/:id`(PM만, `update-project.dto.ts` 이미 존재하나 미사용), `DELETE /project/:id`.

- [ ] **6. base URL 통일** — `apps/web`이 storage·`POST /project`를 `http://localhost:4000`(/api 없이) 하드코딩, 나머지는 `NEXT_PUBLIC_API_URL`(…/api) 사용 → 일원화.

---

## 🔎 2026-07-03 재검증 노트 — 기준 커밋 이후 변경 & FE↔BE 계약 불일치

**`dd03b52` 이후 백엔드 변경** (`a61c414`, `d839236`):

- `createFeedback`에 **최신 버전 검증** 추가 — 최신 버전이 아니면 `UnprocessableDataException` (FE도 최신 버전에서만 작성 진입 허용이라 정합).
- `createFeedback`에 유저 롤 체크 `assertCanCreateFeedback` 추가 — 단 `UserRole` enum이 `Sprout|Seeder` 둘뿐이라 **사실상 "유저 존재 확인" no-op**. 등급 게이팅 명세 확정 전까지는 의미 없음.

**FE↔BE 계약 불일치** (mock/폼 기준 — 배선 전 반드시 합의):

| #   | 항목               | FE                                                                                                                    | BE                                                                                                           |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | 피드백 이미지 개수 | 질문당 **최대 8장**                                                                                                   | `FeedbackItemDto.imageUrl` **단수 1장** (스키마는 1:N이라 DTO/서비스만 수정)                                 |
| 2   | 카테고리 표기      | 작성/목록 mock `plan/design/dev/general`, 성장기록 상세 mock `PLAN/DESIGN/DEVELOP/COMMON`                             | enum `PLAN/DESIGN/DEVELOPMENT/GENERAL` — **3종 혼재**, enum 기준 통일 필요                                   |
| 3   | 질문 응답 shape    | `questionTitle`/`questionContent`/`isRequired`                                                                        | feedback 모듈 `title`/`description`/`required`, growth-record 모듈 `content`/`isRequired` — **3-way 불일치** |
| 4   | 피드백 목록        | `isOpened`(unlock 여부)·게이팅·"해제한 것만" 필터 UI 완성                                                             | 조회 라우트 자체가 없음 (P1-2)                                                                               |
| 5   | 피드백 작성 보상   | 성공 모달에 **티켓 +2 하드코딩**                                                                                      | 보상 없음 (명세 미확정)                                                                                      |
| 6   | 피드백 태그        | 성장기록 작성 폼에 태그 UI 완성(직군당 최대 3개, `feedbackTagStore`), 상세 mock에 `taggedFeedbacks`(작성자+내용) 포함 | ✅ **구현됨 (07-03)**: `FeedbackAdoption` 모델 + `CreateVersionDto.taggedFeedbacks` + 상세 응답 포함         |
| 7   | `updateResults`    | 단수 textarea 1개 (`updateResult`)                                                                                    | `string[]` 확정 (`ArrayMinSize(1)`) — **FE 입력을 리스트형으로 수정 필요**                                   |
| 8   | free-comment 질문  | 피드백 질문 폼에 "자유롭게 하고 싶은 말"(text 없는 고정 질문, `isFreeComment`) 개념                                   | 확정: 고정 문구를 content로 넣는 **일반 질문으로 저장** (스키마 변경 없음) — FE가 제출 시 문구 채워 보낼 것  |
| 9   | `releasedAt`       | 성장기록 상세가 "업데이트 날짜"로 표시                                                                                | ✅ **구현됨 (07-03)**: `createVersion`이 발행 시각으로 설정                                                  |

**기타 발견**: `FeedbackSubmission`에 유저×버전 unique 제약 없음(중복 제출 무방비), 팀원이 자기 프로젝트에 피드백 작성 가능(멤버십 배제 체크 없음), request user 타입 중복(`src/common/types/request-with-user.type.ts` vs `libs/auth/src/authenticated-request.interface.ts`).

---

## 🟨 P2 / 이후

알림(`Notification` — 태그/채택 시, 티켓 지급 tx와 함께), 등급 승급 로직(`UserRole` 전환), 티켓 양도(2차), 북마크/좋아요/즐겨찾기, 사용자 검색(초대용 — 현재 프론트 `MOCK_USERS`), 최근 조회 프로젝트(Redis), 팀장(TeamLeader) 역할 권한(임시저장은 07-03 구현 완료), richer 마크다운(파일/이미지/코드). N차: AI 성장기록 요약 리포트.

---

## ❓ 구현 전 확정해야 할 명세 결정 (PM/기획 확인 필요)

세 명세(원본/보완본 v1/1차)와 디자인 보드가 **숫자/체계가 다름**. 코드에 박기 전 확정:

| 항목              | 후보                                                                                | 현재 코드                                             |
| ----------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 피드백 작성 보상  | +2 (원본, FE 모달 하드코딩) vs +1 (v1/1차)                                          | **보상 없음**                                         |
| 등급 게이팅       | 새싹→시더 승급 vs 전원 시더(0티켓)                                                  | `UserRole` enum만, 로직 없음                          |
| **카테고리 체계** | 코드 4종(PLAN/DESIGN/DEVELOPMENT/GENERAL) vs 디자인 5종(기획/디자인/**FE/BE**/기타) | enum 4종 (성장기록 4종 전부 필수 확정으로 4종에 무게) |
| 상태 enum         | `Hiring` vs `RECRUITING`                                                            | `Hiring`                                              |
| 생성자/팀장 탈퇴  | 권한 위임 vs 프로젝트 삭제                                                          | 미정                                                  |

### ✅ 2026-07-03 확정분 (성장기록 스코프, 백엔드 담당 확인 — **당일 구현 완료**)

> 아래 확정 사항은 전부 구현·테스트 완료 (성장기록 spec 20 + draft spec 10 tests). 상세는 맨 아래 "구현 완료 내역" 참조.

- **태그 = 채택 (보상 포함 구현)**: 버전 발행 시의 피드백 태그가 곧 채택. 알림은 P2(`Notification`)로 분리.
- **태그(채택) 보상**: 태그된 피드백 1건 기준 작성자 **+3**, 같은 피드백이 **2개 이상 직군에서 동시 채택되면 총 +5**. → 기존 `adoptFeedback`의 "작성자별 버전당 +3/+2" 로직과 다름, 대체 예정.
- **태그 한도**: 직군당 3개. **태그 대상**: 이전 버전 전체의 **미채택** 피드백만 (기채택 재태그 불가).
- **성장기록 카테고리**: 4개(PLAN/DESIGN/DEVELOPMENT/GENERAL) **전부 필수**.
- **성장기록 이미지**: 최소 제한 없음, **직군당 최대 8장** (FE 폼의 "필수" 배지는 제거 필요).
- **free-comment 질문**: 고정 문구를 content로 갖는 일반 질문으로 저장 (스키마 변경 없음).
- **updateResults**: 리스트(`string[]`)가 맞음 — FE 입력을 리스트형으로 변경 필요 (현재 textarea 1개).
- **발행 권한**: **Lead만** (현재 "팀원 전원" → 수정 필요). **버전 수정/삭제는 이번 스코프에서 제외** (엔드포인트 없음 유지, 티켓 회수 등 명세는 추후).
- **releasedAt**: 발행 시각(now)으로 설정. **발행 보상**: 팀원 전원 +1 유지.
- **태그=채택 전환 확정**: 기존 `PATCH .../adopt` 라우트, 답변 단위 `isAdopted`/`adoptedCategory`, 작성자별 버전당 +3/+2 보상 로직은 **제거·대체**. 보상은 제출별 독립 정산(작성자 상한 없음). 태그는 **해당 직군 답변을 포함한 제출만** 가능.
- **피드백 질문 커버리지**: 성장기록과 동일하게 4개 직군 전부 필수(각 1~4개).
- **중복 제출 방지**: `FeedbackSubmission`에 유저×버전 unique 제약 추가.
- **버전 순서**: `major.minor.patch` 형식 강제 + 기존 모든 버전보다 커야 발행 가능.
- **임시저장(draft)**: **직군별 공유 draft 1개**(프로젝트×직군 unique — 같은 직군 팀원끼리 공유). 팀원은 자기 직군(`ProjectRole.role` 매핑: Planner→PLAN, Designer→DESIGN, Developer→DEVELOPMENT, Other→GENERAL)만 조회/작성/수정, 리드는 전 직군 접근 + 최종 발행. content는 JSON 스냅샷(발행 시점에만 정식 검증). **발행 성공 시 자동 삭제**.

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

root `docker-compose.yaml`(미사용), `apps/ProSeed.sql`(실제 schema와 다른 옛 ERD), 미사용 deps(`@nestjs/jwt`·`@nestjs/passport`·`cache-manager`·`argon2`), `ProjectMemberRole.TeamLeader`(미사용), `FeedbackQuestion`의 `title`/`content` 응답 shape 불일치(재검증 노트 #3), `libs/auth/`(07-03부터 import 0곳 — `src/common/types/request-with-user.type.ts`로 통일됨, 삭제 가능), `assertCanCreateFeedback`의 no-op 롤 체크.

---

## 📦 2026-07-03 구현 완료 내역 (성장기록 스코프)

- **인프라 (P0 1~3 + 4 일부)**: 전역 `APP_GUARD`(`@Public`/`@OptionalAuth`), 전역 `ValidationPipe(whitelist, transform)`, `BusinessExceptionFilter`(`APP_FILTER`). 스모크 테스트로 공개 200 / 무세션 401 / 404·400 변환 확인.
- **스키마** (`20260703134434_feedback_adoption_tag_and_submission_unique`): `Feedback.isAdopted`/`adoptedCategory` 제거, `FeedbackAdoption`(growthRecord × submission, unique) 신설, `FeedbackSubmission`에 `@@unique([versionId, userId])`.
- **발행 `POST /project/:id/versions`**: Lead 전용, `releasedAt=now`, 4개 직군 성장기록/질문 커버리지 검증(DTO), 직군당 이미지 최대 8장, `taggedFeedbacks`(직군당 최대 3, 병합 검증으로 쪼개기 우회 차단) → 트랜잭션 안에서 태그 검증(프로젝트 소속·미채택·직군 답변 보유) + `FeedbackAdoption` 기록 + **작성자 보상 +3/+5(2개 직군 이상) 정산** + 팀원 전원 +1.
- **버전 순서 제약**: `version`은 `major.minor.patch` 형식 강제(DTO `@Matches`) + 트랜잭션 내에서 **기존 모든 버전보다 커야 발행 가능**(중복은 409, 낮거나 같으면 422, 형식이 다른 레거시 버전은 비교 건너뜀).
- **임시저장 API `/project/:id/drafts`** (마이그레이션 `20260703144203_add_growth_record_draft`): `GET`(권한 필터된 목록), `GET/PUT/DELETE /:category`(PUT은 upsert — 생성/수정 통합, 마지막 수정자 기록). 팀원=자기 직군만·리드=전체 (`growth-record-draft.service.ts`의 `JOB_TYPE_TO_CATEGORY` 매핑). 발행 tx 마지막에 `deleteMany`로 자동 삭제.
- **조회 `GET .../versions/:versionId`**: 공개, growthRecord별 `taggedFeedbacks`(작성자 name/profileImageUrl/role(jobType), content=oneLineReview) 포함.
- **제거**: `PATCH .../feedbacks/:feedbackId/adopt` 라우트·서비스·DTO (태그=채택으로 대체).
- **피드백 부수 수정**: 중복 제출 사전 체크(409) 추가, 응답에서 `isAdopted` 제거.
- **테스트**: `growth-record.service.spec.ts` 20개(권한/중복/버전 순서/발행 보상/draft 자동 삭제/+3/+5/+6 합산/기채택·직군 불일치·타 프로젝트·한도 우회 거부/상세 매핑) + `growth-record-draft.service.spec.ts` 10개(직군 권한 매트릭스·목록 필터·upsert·삭제). jest `moduleNameMapper` 추가로 기존 깨져 있던 스위트도 복구.
- **로컬 테스트 도구** (07-04): `ENABLE_DEV_LOGIN=true`일 때만 better-auth email/password 로그인 활성화(옵트인 — 프로덕션 설정 금지) + `prisma/seed.ts`(로그인 가능한 데모 팀 6명·프로젝트·발행 버전 1.0.0·다직군 피드백 제출·draft, 비밀번호 `proseed123!`) + bruno `Auth/` 폴더(Sign In Lead/Planner/Outsider). Lead·팀원·외부인 관점 권한 매트릭스를 실서버로 검증 완료.
- **FE 배선 시 참고**: 태그는 `taggedFeedbacks: [{ category, submissionIds }]`로 전송(제출 단위 id). `GrowthRecordForm`의 이미지 key 유실 수정 필요(재검증 노트), `updateResults` 리스트 입력으로 변경, free-comment는 고정 문구 채워 전송. 작성 화면은 `PUT /project/:id/drafts/:category`로 수시 저장(자동저장)하고, 리드의 발행 시 draft 내용을 종합해 `POST .../versions` payload를 구성하면 됨(발행 성공 시 draft는 서버가 자동 삭제).
