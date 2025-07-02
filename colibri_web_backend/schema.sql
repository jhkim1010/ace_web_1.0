-- 기존 테이블 삭제
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- companies 테이블 생성
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- users 테이블 생성 (companies 테이블 참조)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ref_id_company INTEGER NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE, -- 관리자 권한 (기본값: FALSE)
    auto_logout_time INTEGER DEFAULT 240, -- 자동 로그아웃 시간 (분 단위, 기본값 4시간)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, ref_id_company),
    CONSTRAINT fk_users_company FOREIGN KEY (ref_id_company) REFERENCES companies(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_users_ref_id_company ON users(ref_id_company);
CREATE INDEX idx_users_username ON users(username);

-- permissions 테이블 생성 (확장형)
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(32) NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(user_id, feature)
);

-- 고객 테이블 생성
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(100),         -- 닉네임 (Nombre Fantasy)
  cuit VARCHAR(20),              -- 사업자 등록번호 (CUIT)
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone1 VARCHAR(30),
  phone2 VARCHAR(30),
  address VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  transportation VARCHAR(100),
  salesperson VARCHAR(100),
  email VARCHAR(100),
  memo TEXT,
  f_total_deuda NUMERIC DEFAULT 0 -- 총 외상
);

-- 국가 테이블 생성
CREATE TABLE IF NOT EXISTS nations (
  id SERIAL PRIMARY KEY,
  name_ko VARCHAR(100),   -- 한글 국가명
  name_en VARCHAR(100),   -- 영문 국가명
  region VARCHAR(50)      -- '북미' 또는 '중남미'
);

-- 북미 국가 데이터 (중복 방지)
INSERT INTO nations (name_ko, name_en, region) VALUES
  ('미국', 'United States', '북미'),
  ('캐나다', 'Canada', '북미'),
  ('멕시코', 'Mexico', '북미')
ON CONFLICT (name_en) DO NOTHING;

-- 중남미 국가 데이터 (중복 방지)
INSERT INTO nations (name_ko, name_en, region) VALUES
  ('브라질', 'Brazil', '중남미'),
  ('아르헨티나', 'Argentina', '중남미'),
  ('칠레', 'Chile', '중남미'),
  ('콜롬비아', 'Colombia', '중남미'),
  ('페루', 'Peru', '중남미'),
  ('베네수엘라', 'Venezuela', '중남미'),
  ('에콰도르', 'Ecuador', '중남미'),
  ('볼리비아', 'Bolivia', '중남미'),
  ('파라과이', 'Paraguay', '중남미'),
  ('우루과이', 'Uruguay', '중남미'),
  ('코스타리카', 'Costa Rica', '중남미'),
  ('쿠바', 'Cuba', '중남미'),
  ('도미니카공화국', 'Dominican Republic', '중남미'),
  ('엘살바도르', 'El Salvador', '중남미'),
  ('과테말라', 'Guatemala', '중남미'),
  ('온두라스', 'Honduras', '중남미'),
  ('니카라과', 'Nicaragua', '중남미'),
  ('파나마', 'Panama', '중남미'),
  ('자메이카', 'Jamaica', '중남미'),
  ('트리니다드토바고', 'Trinidad and Tobago', '중남미')
ON CONFLICT (name_en) DO NOTHING;


-- 주/도/행정구역 테이블 생성
CREATE TABLE IF NOT EXISTS states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),           -- 주/도/행정구역 이름
  ref_id_nation INTEGER REFERENCES nations(id) ON DELETE CASCADE
);

-- 아르헨티나의 provincia 데이터 (ref_id_nation = 5, 중복 방지)
INSERT INTO states (name, ref_id_nation) VALUES
  ('Buenos Aires', 5),
  ('Catamarca', 5),
  ('Chaco', 5),
  ('Chubut', 5),
  ('Córdoba', 5),
  ('Corrientes', 5),
  ('Entre Ríos', 5),
  ('Formosa', 5),
  ('Jujuy', 5),
  ('La Pampa', 5),
  ('La Rioja', 5),
  ('Mendoza', 5),
  ('Misiones', 5),
  ('Neuquén', 5),
  ('Río Negro', 5),
  ('Salta', 5),
  ('San Juan', 5),
  ('San Luis', 5),
  ('Santa Cruz', 5),
  ('Santa Fe', 5),
  ('Santiago del Estero', 5),
  ('Tierra del Fuego', 5),
  ('Tucumán', 5)
ON CONFLICT (name) DO NOTHING;

-- vendedores 테이블 생성
CREATE TABLE IF NOT EXISTS vendedores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- vendedores 데이터 삽입 (중복 방지)
INSERT INTO vendedores (name) VALUES
  ('marcos'),
  ('lucy'),
  ('santiago'),
  ('lucas')
ON CONFLICT (name) DO NOTHING;
