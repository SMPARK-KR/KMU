# 🇰🇷 에어코리아 실시간 대기질 대시보드

이 프로젝트는 에어코리아 공공 데이터 대시보드 및 방명록 기능을 포함하는 웹 서비스입니다. Next.js App Router와 Turso Database를 기반으로 제작되었습니다.

## 주요 기능
- **실시간 대기질 데이터 연동**: 에어코리아 API를 이용해 대기질 데이터를 대시보드로 시각화 ('좋음', '보통', '나쁨' 등 직관적 표시).
- **소셜 로그인 및 회원 리스트 관리**: Google OAuth 로그인을 지원하며 Turso 데이터베이스(users 테이블)에 등록된 허용된 사용자만 접근할 수 있습니다.
- **방명록**: 인증된 사용자 간의 서비스 공유 및 피드백을 위한 방명록 기능을 지원합니다.

---

## 🚀 실행 및 로컬 테스트 방법 (Github에서 Pull 받은 후)

본 프로젝트를 로컬 개발 환경에서 실행하는 상세 절차입니다.

### 1. 패키지 설치
포털(본 리포지토리)을 클론하거나 Pull 받은 뒤, 프로젝트 폴더로 이동하여 패키지를 설치합니다.
```bash
npm install
```

### 2. `.env.local` 환경 변수 설정
프로젝트 최상단 폴더에 `.env.local` 파일을 생성하고 아래의 환경 변수 값들을 입력해야 합니다.

```env
# 에어코리아 공공데이터 API 키
AIRKOREA_API_KEY=your_decoded_api_key_here

# Turso 데이터베이스 연결 설정
TURSO_DATABASE_URL=libsql://your-turso-db-url.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
TURSO_CONNECTION_URL=libsql://your-turso-db-url.turso.io

# NextAuth (구글 소셜 로그인) 설정
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. 데이터베이스(Turso) 테이블 스키마 적용 및 허용 유저 등록
1. `.env.local` 에 Turso 변수를 모두 설정했다면, 터미널(또는 cmd)에서 다음 명령어를 실행하여 테이블 구조를 Turso 서버에 Push 합니다.
   ```bash
   npx drizzle-kit push
   ```
2. 접근 권한을 가질 이메일을 화이트리스트에 등록하기 위해 시드 스크립트를 실행합니다. (기본적으로 `kts123@kookmin.ac.kr` 계정이 추가되도록 스크립트가 세팅되어 있습니다.)
   ```bash
   npx tsx scripts/seedUsers.ts
   ```

### 4. 로컬 서버 실행
모든 준비가 완료되었습니다! 개발 서버를 시작합니다.
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 으로 접속하면 대시보드 화면에 접근할 수 있습니다.

---

## 🌐 Vercel 서비스 배포

이 프로젝트는 GitHub에 코드를 Push하는 즉시 Vercel 환경에서 자동으로 빌드 및 배포되도록 구성되어 있습니다. Vercel 대시보드의 **Environment Variables** 탭에 로컬 `.env.local`에서 설정한 동일한 환경 변수들을 추가해주셔야 정상적으로 작동합니다.
