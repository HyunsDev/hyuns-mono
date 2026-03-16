# AGNETS.md for `typebook-mono`

이 문서는 `typebook-mono` 워크스페이스 전체에 적용됩니다.
더 아래 경로에 별도 `AGENTS.md`가 있으면 그 문서가 해당 하위 트리에서 우선합니다.

## 저장소 개요

이 저장소는 `pnpm` + `turbo` 기반 모노레포입니다.

- `apps/api`
  - NestJS 기반 API 서버
- `apps/web`
  - Next.js App Router 기반 웹 앱
- `apps/infra`
  - AWS CDK 인프라 코드
- `packages/contract`
  - 프론트엔드와 백엔드가 공유하는 ts-rest + Zod API 계약
- `packages/database`
  - Prisma 스키마, 마이그레이션, 클라이언트 관련 코드
- `packages/ui`
  - 공용 UI 컴포넌트와 Storybook
- `packages/shared`, `packages/primitive`
  - 공용 유틸, 응답 포맷, 스키마 조각, 코드/식별자 정의
- `packages/backend-*`
  - 백엔드 공용 모듈, DDD/코어 계층
- `packages/eslint-config`, `packages/typescript-config`, `packages/jest-config`
  - 워크스페이스 공통 설정 패키지

## 우선 원칙

- 먼저 가장 가까운 패키지/앱의 구조와 관례를 따릅니다.
- 새 패턴을 만들기보다 인접 파일의 네이밍, export 방식, 디렉터리 구성을 복제하는 편이 안전합니다.
- 변경은 가능한 한 가장 좁은 범위로 하고, 루트 전역 규칙보다 로컬 일관성을 우선합니다.
- 생성 산출물은 소스가 아닙니다. 실제 원본 파일을 수정하세요.

## 생성물과 수정 금지 대상

직접 수정하지 말아야 하는 대표 경로:

- `**/dist/**`
- `**/.turbo/**`
- `apps/web/.next/**`
- `apps/infra/cdk.out/**`
- `packages/database/generated/**`
- `**/node_modules/**`

이 경로들은 빌드, 코드 생성, 개발 서버, 인프라 synth 결과물입니다.
필요한 변경은 항상 대응하는 원본 소스에서 수행합니다.

## 작업 시작 전 체크

- 루트 스크립트는 `package.json`, 워크스페이스 범위는 `pnpm-workspace.yaml`, 파이프라인은 `turbo.json`에서 확인합니다.
- 특정 패키지를 수정할 때는 그 패키지의 `package.json`과 로컬 문서를 먼저 봅니다.
- 계약, 데이터베이스, 인프라처럼 파급 범위가 큰 패키지는 소비자 앱도 함께 확인합니다.

## 자주 쓰는 명령

루트 전체 기준:

- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm dev`

특정 패키지만 검증할 때:

- `pnpm --filter <package-name> lint`
- `pnpm --filter <package-name> typecheck`
- `pnpm --filter <package-name> build`

예시:

- `pnpm --filter @workspace/contract typecheck`
- `pnpm --filter api test:contracts`
- `pnpm --filter web typecheck`
- `pnpm --filter @workspace/ui storybook`

## 모노레포에서 자주 놓치는 점

- `packages/contract`를 바꾸면 `apps/api` 구현과 `apps/web` 타입 소비가 함께 영향을 받습니다.
- `packages/database` 변경은 Prisma 생성물, 마이그레이션, 서버 런타임 코드까지 연쇄적으로 영향을 줍니다.
- `packages/shared`와 `packages/primitive`는 의존 범위가 넓어서 작은 타입 변경도 파급력이 큽니다.
- `apps/infra`와 `@workspace/infra`는 둘 다 인프라 관련이지만 경로와 역할이 다를 수 있으니 수정 전 실제 import 위치를 확인합니다.
- `packages/ui`는 `dist`가 아니라 `src`를 직접 export하므로 공개 API 변경 시 소비 앱에서 바로 깨질 수 있습니다.

## 패키지별 가이드

- `packages/contract`
  - 하위 [AGENTS.md](/Users/hyuns/Repos/typebook-mono/packages/contract/AGENTS.md)를 우선 따릅니다.
  - 계약 트리, export 체인, 에러 집계, `inspect` 검증이 중요합니다.
- `packages/database`
  - `prisma/`와 `src/`를 원본으로 보고, `generated/`는 직접 수정하지 않습니다.
  - 스키마 변경 시 generate 또는 migration 흐름까지 고려합니다.
- `apps/api`
  - NestJS controller/handler, contract binding, exception filter 영향까지 확인합니다.
- `apps/web`
  - `app/` 디렉터리 중심의 Next.js 구조를 사용합니다.
- `packages/ui`
  - 컴포넌트는 재사용성과 export surface를 함께 확인합니다.

## 변경 전략

### 1. 계약 변경

- `packages/contract`에서 스키마/라우터를 수정합니다.
- `apps/api`의 실제 handler 구현과 경로 정합성을 확인합니다.
- 필요하면 `apps/web`의 소비 타입도 함께 점검합니다.

### 2. DB 변경

- `packages/database/prisma`를 먼저 수정합니다.
- 마이그레이션 또는 generate가 필요한지 확인합니다.
- DB shape를 가정하는 `apps/api` 코드도 함께 확인합니다.

### 3. 공용 타입/유틸 변경

- `packages/shared`, `packages/primitive` 변경은 의존 범위를 먼저 탐색합니다.
- 광범위하게 쓰이는 export는 rename보다 additive change가 더 안전합니다.

### 4. UI 변경

- `packages/ui`와 `apps/web`의 스타일/소비 방식을 함께 확인합니다.
- 기존 컴포넌트 API와 story 사용 예시를 먼저 확인합니다.

## 검증 원칙

- 가능한 한 변경한 패키지 단위로 먼저 검증한 뒤, 파급 범위가 큰 경우 소비자까지 확장합니다.
- 최소 검증은 보통 `lint`와 `typecheck`입니다.
- 계약/스키마/공용 타입 변경은 관련 앱 검증을 생략하지 않는 편이 좋습니다.
- 실행하지 못한 검증이 있으면 마지막에 명확히 남깁니다.

## 커밋 전 점검

- 불필요한 생성물 변경이 포함되지 않았는지 확인합니다.
- export 체인이 끊기지 않았는지 확인합니다.
- 루트 명령보다 더 좁은 검증 명령이 있다면 그 결과를 우선 확인합니다.
- 영향 범위가 큰 변경이라면 breaking change 여부를 명시합니다.

## 문서 작성 원칙

- README는 사람용 설명, AGENTS 계열 문서는 에이전트용 작업 지침에 가깝게 작성합니다.
- 추상적인 원칙보다 실제 경로, 명령, 검증 방법, 흔한 실수를 적는 편이 유용합니다.
- 패키지별 상세 규칙은 루트 문서에 길게 중복하지 말고 하위 문서로 위임합니다.
