// PostgreSQLでユーザー情報を管理する （旧: SQLiteのファイル保存から移行）

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

  // 「誰が、どの機能を使えるか」を持つテーブル。
  // feature には 'lang:python' / 'ai:high-accuracy' のような文字列が入る。
  // expires_at が NULL なら無期限、日時が入っていればその時刻まで有効。
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entitlements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      feature TEXT NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, feature)
    )
  `);

  // AIレビューの1日ごとの使用回数。used_on は 'YYYY-MM-DD' 形式。
  // メモリではなくDBに持つので、pm2を再起動してもカウントが消えない。
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      used_on TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      UNIQUE(user_id, used_on)
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

// --- ここから課金の下地 -------------------------------------------------

// このユーザーが指定の機能を使えるか。期限切れのものは無効として扱う。
async function hasEntitlement(userId, feature) {
  const { rows } = await pool.query(
    `SELECT 1 FROM entitlements
     WHERE user_id = $1 AND feature = $2
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId, feature]
  );
  return rows.length > 0;
}

// このユーザーが今持っている権限の一覧（期限切れを除く）
async function getEntitlements(userId) {
  const { rows } = await pool.query(
    `SELECT feature FROM entitlements
     WHERE user_id = $1
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId]
  );
  return rows.map((r) => r.feature);
}

// 権限を付与する。expiresAt に null を渡すと無期限。
// すでに同じ権限があれば期限だけ上書きする（更新の延長に使える）。
async function grantEntitlement(userId, feature, expiresAt = null) {
  await pool.query(
    `INSERT INTO entitlements (user_id, feature, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, feature)
     DO UPDATE SET expires_at = EXCLUDED.expires_at`,
    [userId, feature, expiresAt]
  );
}

// 権限を取り消す（解約時などに使う）
async function revokeEntitlement(userId, feature) {
  await pool.query(
    'DELETE FROM entitlements WHERE user_id = $1 AND feature = $2',
    [userId, feature]
  );
}

// 今日すでに何回AIレビューを使ったか
async function getAiUsageToday(userId) {
  const { rows } = await pool.query(
    'SELECT count FROM ai_usage WHERE user_id = $1 AND used_on = $2',
    [userId, todayStr()]
  );
  return rows.length > 0 ? rows[0].count : 0;
}

// 使用回数を1増やして、増やした後の値を返す
async function incrementAiUsage(userId) {
  const { rows } = await pool.query(
    `INSERT INTO ai_usage (user_id, used_on, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, used_on)
     DO UPDATE SET count = ai_usage.count + 1
     RETURNING count`,
    [userId, todayStr()]
  );
  return rows[0].count;
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
  touchLoginStreak,
  hasEntitlement,
  getEntitlements,
  grantEntitlement,
  revokeEntitlement,
  getAiUsageToday,
  incrementAiUsage
};