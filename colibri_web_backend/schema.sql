-- 기존 테이블 삭제
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, ref_id_company),
    CONSTRAINT fk_users_company FOREIGN KEY (ref_id_company) REFERENCES companies(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_users_ref_id_company ON users(ref_id_company);
CREATE INDEX idx_users_username ON users(username); 