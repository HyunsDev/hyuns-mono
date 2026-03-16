<p align="center">
  <img src="../../assets/logo.png" alt="UniBook Logo" width="120" />
</p>

<h1 align="center">@workspace/contract</h1>

<p align="center">
    ts-rest와 Zod 기반의 API Contract 패키지 (Frontend/Backend Shared)
</p>

## 개요
`@workspace/contract`는 프론트엔드와 백엔드가 동일한 API 계약을 공유하기 위한 패키지입니다.  
`resources`의 공통 DTO/스키마/에러/enum을 기반으로, `operations`에서 실제 ts-rest 계약을 정의합니다.

## 패키지 구조
```text
packages/contract/
└─ src/
   ├─ common      # 공통 코드 (공유 타입/헬퍼/상수)
   ├─ internal    # 패키지 내부 전용 코드 (export 금지)
   ├─ resources   # 도메인 공통 리소스 (dto/enum/error/schema)
   └─ operations  # ts-rest endpoint/route 계약
```

## 공개 규칙 (요약)
- `src/index.ts`는 `common`, `resources`, `operations`만 export 합니다.
- `internal` 폴더는 패키지 내부 전용이며, 외부에서 import하지 않습니다.
- 자세한 규칙은 `AGENTS.md`를 따릅니다.

## 사용 예시

### 서버(백엔드)에서 계약 라우터 조합
```ts
import { api } from '@workspace/contract';

// 예시: 도메인별 contract-router를 조합한 뒤
// 실제 라우팅은 프로젝트 구조에 맞게 구성합니다.
```

### 클라이언트(프론트엔드)에서 타입/스키마 사용
```ts
import { z } from 'zod';
import { commonSomething, resourcesSomething, operationSomething } from '@workspace/contract';

// 응답 타입 예시
type SignInRequest = z.input<typeof operationSomething.schemas.signIn>;
```

## 새 계약 추가 가이드
1. `resources/<domain>`에 해당 도메인의 공통 DTO/스키마/에러를 정의 또는 수정합니다.
2. `operations/<domain>`에 endpoint contract를 추가/수정합니다.
3. 필요 시 `src/index.ts`를 갱신해 공개 export를 정리합니다.
4. `AGENTS.md`의 변경 체크리스트를 충족했는지 확인합니다.

## 운영 규칙
- 스키마 변경은 해당 엔드포인트 계약과 같이 다뤄야 합니다.
- 공통 에러/응답 포맷은 통일된 형식을 유지합니다.
- `internal`은 문서상/관행상 공개 export하지 않습니다.

## 파일
- `AGENTS.md` : 계약 구조·네이밍·변경 가이드·품질 규칙
