const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = 4000;
const SECRET_KEY = 'your_secret_key';

// PostgreSQL 연결 설정
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'colibri',
  password: 'wkrdjqwnd',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// 회원가입
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '사용자명, 회사명, 비밀번호를 입력하세요.' });
  }

  try {
    // email에서 username과 company_name 분리
    const [username, companyName] = email.split('@');
    if (!username || !companyName) {
      return res.status(400).json({ success: false, message: '올바른 형식으로 입력하세요. (예: user_name@company_name)' });
    }

    // 트랜잭션 시작
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 회사가 존재하는지 확인하고, 없으면 생성
      let companyResult = await client.query('SELECT id FROM companies WHERE name = $1', [companyName]);
      let companyId;
      
      if (companyResult.rows.length === 0) {
        // 회사가 없으면 새로 생성
        const newCompanyResult = await client.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [companyName]);
        companyId = newCompanyResult.rows[0].id;
      } else {
        companyId = companyResult.rows[0].id;
      }

      // 2. 해당 회사에서 사용자명이 이미 존재하는지 확인
      const existingUser = await client.query('SELECT id FROM users WHERE username = $1 AND ref_id_company = $2', [username, companyId]);
      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: '해당 회사에서 이미 존재하는 사용자명입니다.' });
      }

      // 3. 사용자 추가
      await client.query('INSERT INTO users (username, ref_id_company, password) VALUES ($1, $2, $3)', [username, companyId, password]);
      
      await client.query('COMMIT');
      res.json({ success: true, message: '회원가입이 완료되었습니다.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '사용자명, 회사명, 비밀번호를 입력하세요.' });
  }

  try {
    // email에서 username과 company_name 분리
    const [username, companyName] = email.split('@');
    if (!username || !companyName) {
      return res.status(400).json({ success: false, message: '올바른 형식으로 입력하세요. (예: user_name@company_name)' });
    }

    // JOIN을 사용해서 사용자와 회사 정보를 함께 조회
    const user = await pool.query(`
      SELECT u.id, u.username, c.name as company_name 
      FROM users u 
      JOIN companies c ON u.ref_id_company = c.id 
      WHERE u.username = $1 AND c.name = $2 AND u.password = $3
    `, [username, companyName, password]);

    if (user.rows.length > 0) {
      const userData = user.rows[0];
      // JWT 토큰 생성
      const token = jwt.sign({ 
        userId: userData.id, 
        username: userData.username, 
        companyName: userData.company_name 
      }, SECRET_KEY, { expiresIn: '1h' });
      
      res.json({ 
        success: true, 
        token,
        user: {
          username: userData.username,
          companyName: userData.company_name
        }
      });
    } else {
      res.status(401).json({ success: false, message: '사용자명, 회사명 또는 비밀번호가 올바르지 않습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 