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

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '토큰이 필요합니다.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
    req.user = user;
    next();
  });
};

// 회원가입
app.post('/api/register', async (req, res) => {
  const { email, password, autoLogoutTime = 240, isAdmin = false } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '사용자명, 회사명, 비밀번호를 입력하세요.' });
  }

  try {
    // email에서 username과 company_name 분리
    const [username, companyName] = email.split('@');
    if (!username || !companyName) {
      return res.status(400).json({ success: false, message: '올바른 형식으로 입력하세요. (예: user_name@company_name)' });
    }

    // admin이 아닌 경우 autoLogoutTime을 기본값으로 설정
    const finalAutoLogoutTime = isAdmin ? (autoLogoutTime || 240) : 240;

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

      // 3. 사용자 추가 (is_admin과 auto_logout_time 포함)
      await client.query('INSERT INTO users (username, ref_id_company, password, is_admin, auto_logout_time) VALUES ($1, $2, $3, $4, $5)', [username, companyId, password, isAdmin, finalAutoLogoutTime]);
      
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

    // JOIN을 사용해서 사용자와 회사 정보를 함께 조회 (is_admin과 auto_logout_time 포함)
    const user = await pool.query(`
      SELECT u.id, u.username, u.is_admin, u.auto_logout_time, c.name as company_name 
      FROM users u 
      JOIN companies c ON u.ref_id_company = c.id 
      WHERE u.username = $1 AND c.name = $2 AND u.password = $3
    `, [username, companyName, password]);

    if (user.rows.length > 0) {
      const userData = user.rows[0];
      const autoLogoutTime = userData.auto_logout_time || 240; // 기본값 4시간
      
      // JWT 토큰 생성 (사용자별 설정된 시간으로 만료)
      const token = jwt.sign({ 
        userId: userData.id, 
        username: userData.username, 
        companyName: userData.company_name,
        isAdmin: userData.is_admin,
        autoLogoutTime: autoLogoutTime
      }, SECRET_KEY, { expiresIn: `${autoLogoutTime}m` });
      
      res.json({ 
        success: true, 
        token,
        user: {
          username: userData.username,
          companyName: userData.company_name,
          isAdmin: userData.is_admin,
          autoLogoutTime: autoLogoutTime
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

// 사용자 설정 업데이트 API (admin만 접근 가능)
app.put('/api/user/settings', authenticateToken, async (req, res) => {
  const { autoLogoutTime } = req.body;
  const userId = req.user.userId;
  const isAdmin = req.user.isAdmin;

  // admin이 아닌 경우 접근 거부
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 설정을 변경할 수 있습니다.' });
  }

  if (!autoLogoutTime || autoLogoutTime < 1 || autoLogoutTime > 1440) {
    return res.status(400).json({ success: false, message: '자동 로그아웃 시간은 1분에서 1440분(24시간) 사이여야 합니다.' });
  }

  try {
    await pool.query('UPDATE users SET auto_logout_time = $1 WHERE id = $2', [autoLogoutTime, userId]);
    res.json({ success: true, message: '설정이 업데이트되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 토큰 검증 API (선택사항)
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: '토큰이 유효합니다.',
    user: req.user 
  });
});

// 로그아웃 API (선택사항)
app.post('/api/logout', authenticateToken, (req, res) => {
  // 실제로는 토큰 블랙리스트에 추가하는 것이 좋지만,
  // 여기서는 단순히 성공 응답만 반환
  res.json({ success: true, message: '로그아웃되었습니다.' });
});

// ===================== 고객(Customer) API =====================

// 고객 전체 목록 조회
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.json({ success: true, customers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 고객 추가
app.post('/api/customers', async (req, res) => {
  const {
    nickname, cuit, first_name, last_name, phone1, phone2, address, city, state, country,
    transportation, salesperson, email, memo, f_total_deuda = 0
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (nickname, cuit, first_name, last_name, phone1, phone2, address, city, state, country, transportation, salesperson, email, memo, f_total_deuda)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [nickname, cuit, first_name, last_name, phone1, phone2, address, city, state, country, transportation, salesperson, email, memo, f_total_deuda]
    );
    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 고객 수정
app.put('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  const {
    nickname, cuit, first_name, last_name, phone1, phone2, address, city, state, country,
    transportation, salesperson, email, memo, f_total_deuda
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers SET nickname=$1, cuit=$2, first_name=$3, last_name=$4, phone1=$5, phone2=$6, address=$7, city=$8, state=$9, country=$10, transportation=$11, salesperson=$12, email=$13, memo=$14, f_total_deuda=$15 WHERE id=$16 RETURNING *`,
      [nickname, cuit, first_name, last_name, phone1, phone2, address, city, state, country, transportation, salesperson, email, memo, f_total_deuda, id]
    );
    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 고객 상세 조회
app.get('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: '고객을 찾을 수 없습니다.' });
    }
    res.json({ success: true, customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 고객 삭제 (선택)
app.delete('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ===================== 국가(Nations) API =====================

// 국가 전체 목록 조회
app.get('/api/nations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM nations ORDER BY name_en');
    res.json({ success: true, nations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 국가별 주 목록 조회
app.get('/api/nations/:nationId/states', async (req, res) => {
  const nationId = req.params.nationId;
  try {
    const result = await pool.query('SELECT * FROM states WHERE ref_id_nation = $1 ORDER BY name', [nationId]);
    res.json({ success: true, states: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ===================== 주(States) API =====================

// 주 전체 목록 조회
app.get('/api/states', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, n.name_en as nation_name 
      FROM states s 
      JOIN nations n ON s.ref_id_nation = n.id 
      ORDER BY n.name_en, s.name
    `);
    res.json({ success: true, states: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// ===================== 판매원(Vendedores) API =====================

// 판매원 전체 목록 조회
app.get('/api/vendedores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendedores ORDER BY name');
    res.json({ success: true, vendedores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 