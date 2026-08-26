// SQLiteでユーザー情報を管理する。ファイル1つで完結するので、
// テスト段階の個人開発ではこれで十分。

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'codedrill.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_sub TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    picture TEXT,
    login_streak INTEGER DEFAULT 1,
    last_login_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS solved_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    solved_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, problem_id)
  )
`);

// 既存のusersテーブルに has_seen_onboarding が無ければ追加する
// （SQLiteのALTER TABLEはIF NOT EXISTSに対応していないため手動でチェック）
const userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((c) => c.name === 'has_seen_onboarding')) {
  db.exec('ALTER TABLE users ADD COLUMN has_seen_onboarding INTEGER DEFAULT 0');
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Googleログインのたびに呼ばれる。初回はユーザー作成、
// 2回目以降は情報更新 + 連続ログイン日数(login_streak)の計算をする。
function upsertUser({ googleSub, email, name, picture }) {
  const existing = db.prepare('SELECT * FROM users WHERE google_sub = ?').get(googleSub);
  const today = todayStr();

  if (!existing) {
    const info = db.prepare(`
      INSERT INTO users (google_sub, email, name, picture, login_streak, last_login_date)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(googleSub, email, name, picture, today);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }

  let newStreak = existing.login_streak;
  if (existing.last_login_date !== today) {
    newStreak = existing.last_login_date === yesterdayStr() ? existing.login_streak + 1 : 1;
  }

  db.prepare(`
    UPDATE users SET email = ?, name = ?, picture = ?, login_streak = ?, last_login_date = ?
    WHERE id = ?
  `).run(email, name, picture, newStreak, today, existing.id);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(existing.id);
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
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
function markOnboardingSeen(userId) {
  db.prepare('UPDATE users SET has_seen_onboarding = 1 WHERE id = ?').run(userId);
}

// 問題を正解したときに記録する。同じ問題を再度解いても solved_at が
// 更新されるだけで、行が重複することはない（UNIQUE制約）。
function markSolved(userId, problemId) {
  db.prepare(`
    INSERT INTO solved_problems (user_id, problem_id, solved_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id, problem_id) DO UPDATE SET solved_at = excluded.solved_at
  `).run(userId, problemId);
}

// バッジ表示用: 解いた問題IDの一覧だけを返す
function getSolvedProblemIds(userId) {
  const rows = db.prepare('SELECT problem_id FROM solved_problems WHERE user_id = ?').all(userId);
  return rows.map((r) => r.problem_id);
}

// 履歴ページ用: 解いた日時つきで新しい順に返す
function getSolvedHistory(userId) {
  return db.prepare(`
    SELECT problem_id, solved_at FROM solved_problems
    WHERE user_id = ?
    ORDER BY solved_at DESC
  `).all(userId);
}

module.exports = {
  upsertUser,
  getUserById,
  publicUser,
  markSolved,
  getSolvedProblemIds,
  getSolvedHistory,
  markOnboardingSeen
};
