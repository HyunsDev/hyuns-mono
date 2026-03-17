# auth-web

Vite 기반 인증 전용 앱입니다.

## Environment

- `VITE_API_BASE_URL`: API 서버 베이스 URL

개발 환경 예시:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Google OAuth를 사용하려면 API 서버의 `GOOGLE_OAUTH_ALLOWED_REDIRECT_URLS`에 아래 주소가 포함되어야 합니다.

```txt
http://localhost:5173/auth/callback
```
