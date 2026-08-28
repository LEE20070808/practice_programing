// PostgreSQLでユーザー情報を管理する（旧: SQLiteのファイル保存から移行）

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// サーバー起動時に一度だけ呼ぶ。テーブルが無ければ作成する。
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_sub TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT,
      picture TEXT,
      login_streak INTEGER DEFAULT 1,
      last_login_date TEXT,
      has_seen_onboarding INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS solved_problems (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      problem_id INTEGER NOT NULL,
      solved_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, problem_id)
    )
  `);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Googleログインのたびに呼ばれる。初回はユーザーを作成し、
// 既存ユーザーならプロフィール情報だけ更新する（ストリークの計算はtouchLoginStreakに任せる）
async function upsertUser({ googleSub, email, name, picture }) {
  const { rows } = await pool.query('SELECT * FROM users WHERE google_sub = $1', [googleSub]);
  const existing = rows[0];

  if (!existing) {
    const result = await pool.query(
      `INSERT INTO users (google_sub, email, name, picture, login_streak, last_login_date)
       VALUES ($1, $2, $3, $4, 1, $5) RETURNING *`,
      [googleSub, email, name, picture, todayStr()]
    );
    return result.rows[0];
  }

  await pool.query(
    'UPDATE users SET email = $1, name = $2, picture = $3 WHERE id = $4',
    [email, name, picture, existing.id]
  );

  return touchLoginStreak(existing.id);
}

// ログインセッションが有効な間、ページを開くたびに呼ばれる。
// 「今日はまだ記録していない」ときだけ連続ログイン日数を更新する。
async function touchLoginStreak(userId) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = rows[0];
  if (!user) return null;

  const today = todayStr();
  if (user.last_login_date === today) {
    return user; // 今日はすでに記録済み
  }

  const newStreak = user.last_login_date === yesterdayStr() ? user.login_streak + 1 : 1;
  const result = await pool.query(
    'UPDATE users SET login_streak = $1, last_login_date = $2 WHERE id = $3 RETURNING *',
    [newStreak, today, userId]
  );
  return result.rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

// フロントに返してよい項目だけに絞る（google_subなど内部IDは渡さない）
function publicUser(user) {
  return {
    name: user.name,
    email: user.email,
    picture: user.picture,
    loginStreak: user.login_streak,
    hasSeenOnboarding: !!user.has_seen_onboarding
  };
}

// 初回ログイン時のスライドを見終わったら呼ぶ
async function markOnboardingSeen(userId) {
  await pool.query('UPDATE users SET has_seen_onboarding = 1 WHERE id = $1', [userId]);
}

// 問題を正解したときに記録する。同じ問題を再度解いても solved_at が
// 更新されるだけで、行が重複することはない（UNIQUE制約）。
async function markSolved(userId, problemId) {
  await pool.query(
    `INSERT INTO solved_problems (user_id, problem_id, solved_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id, problem_id) DO UPDATE SET solved_at = EXCLUDED.solved_at`,
    [userId, problemId]
  );
}

// バッジ表示用: 解いた問題IDの一覧だけを返す
async function getSolvedProblemIds(userId) {
  const { rows } = await pool.query(
    'SELECT problem_id FROM solved_problems WHERE user_id = $1',
    [userId]
  );
  return rows.map((r) => r.problem_id);
}

// 履歴ページ用: 解いた日時つきで新しい順に返す
// （フロント側の表示ロジックに合わせて "YYYY-MM-DD HH:MM:SS" 形式の文字列で返す）
async function getSolvedHistory(userId) {
  const { rows } = await pool.query(
    `SELECT problem_id, to_char(solved_at, 'YYYY-MM-DD HH24:MI:SS') AS solved_at
     FROM solved_problems
     WHERE user_id = $1
     ORDER BY solved_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  pool,
  initDb,
  upsertUser,
  getUserById,
  publicUser,
  markSolved,
  getSolvedProblemIds,
  getSolvedHistory,
  markOnboardingSeen,
  touchLoginStreak
};
