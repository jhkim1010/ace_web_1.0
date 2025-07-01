# Colibri - 사용자 인증 시스템

React + TypeScript 프론트엔드와 Node.js + Express 백엔드로 구성된 사용자 인증 시스템입니다.

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm run install-all
```

### 2. 데이터베이스 설정
PostgreSQL이 설치되어 있어야 합니다.
```bash
# PostgreSQL 연결 후 스키마 실행
psql -h localhost -U postgres -d colibri -f colibri_web_backend/schema.sql
```

### 3. 개발 서버 실행
```bash
npm run dev
```

이 명령어 하나로 백엔드(포트 4000)와 프론트엔드(포트 3000)가 동시에 실행됩니다!

## 📁 프로젝트 구조

```
ACE1/
├── package.json                  # 루트 패키지 설정
├── README.md                    # 프로젝트 문서
├── .gitignore                   # Git 무시 파일
├── colibri_web_backend/         # Node.js + Express 서버
│   ├── index.js                 # 메인 서버 파일
│   ├── schema.sql               # 데이터베이스 스키마
│   └── package.json             # 백엔드 의존성
└── colibri_web_frontend/        # React + TypeScript 클라이언트
    ├── src/
    │   ├── App.tsx              # 메인 앱 컴포넌트
    │   ├── Login.tsx            # 로그인/회원가입 컴포넌트
    │   ├── MainPage.tsx         # 메인 페이지 컴포넌트
    │   ├── LanguageSelector.tsx # 언어 선택 컴포넌트
    │   ├── i18n.ts              # 다국어 설정
    │   └── locales/             # 번역 파일들
    │       ├── en/translation.json
    │       ├── es/translation.json
    │       └── ko/translation.json
    └── package.json             # 프론트엔드 의존성
```

## 🛠️ 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run install-all` | 모든 의존성 설치 (백엔드 + 프론트엔드) |
| `npm run dev` | 개발 서버 동시 실행 (백엔드 + 프론트엔드) |
| `npm run server` | 백엔드 서버만 실행 |
| `npm run client` | 프론트엔드 서버만 실행 |
| `npm run build` | 프론트엔드 빌드 |

## 🔧 기술 스택

### 백엔드
- **Node.js** + **Express.js**
- **PostgreSQL** (데이터베이스)
- **JWT** (인증 토큰)
- **CORS** (크로스 오리진 요청)

### 프론트엔드
- **React 19** + **TypeScript**
- **React Router** (라우팅)
- **React i18next** (다국어 지원)
- **LocalStorage** (토큰 저장)

## 📊 데이터베이스 구조

### companies 테이블
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### users 테이블
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ref_id_company INTEGER NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, ref_id_company),
    CONSTRAINT fk_users_company FOREIGN KEY (ref_id_company) REFERENCES companies(id) ON DELETE CASCADE
);
```

## 🎯 주요 기능

- ✅ 사용자명@회사명 형식의 로그인
- ✅ 회원가입 및 로그인
- ✅ JWT 토큰 기반 인증
- ✅ 메인 페이지 자동 이동
- ✅ 로그아웃 기능
- ✅ 반응형 UI 디자인
- ✅ 다국어 지원 (영어, 스페인어, 한국어)
- ✅ 언어 자동 감지 및 선택

## 🔐 사용법

1. **회원가입**: `user_name@company_name` 형식으로 입력
2. **로그인**: 가입한 계정으로 로그인
3. **메인 페이지**: 로그인 성공 시 자동 이동
4. **언어 변경**: 우상단 언어 선택 버튼 클릭
5. **로그아웃**: 우상단 버튼으로 로그아웃

## 🌍 지원 언어

- 🇺🇸 **English** (영어)
- 🇪🇸 **Español** (스페인어)
- 🇰🇷 **한국어** (한국어)

## 🚨 주의사항

- PostgreSQL 서버가 실행 중이어야 합니다
- 데이터베이스 `colibri`가 생성되어 있어야 합니다
- 백엔드 서버는 포트 4000, 프론트엔드는 포트 3000을 사용합니다 