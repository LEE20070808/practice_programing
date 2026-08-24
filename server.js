require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // 例: https://xxxx.onrender.com/auth/google/callback

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn('警告: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI のいずれかが未設定です。.envまたはRenderの環境変数を確認してください。');
}

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

// Renderのプロキシ経由でも req.protocol が https と正しく判定されるようにする
app.set('trust proxy', 1);

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30日間ログイン保持
  }
}));

app.use(express.static(__dirname));

// Googleのログインページへリダイレクトする
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account'
  });
  res.redirect(url);
});

// Googleからのリダイレクト先。認可コードをトークンに交換してログイン状態を作る
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect('/?login=failed');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const user = db.upsertUser({
      googleSub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });

    req.session.userId = user.id;
    res.redirect('/');
  } catch (err) {
    console.error('Google認証エラー:', err);
    res.redirect('/?login=failed');
  }
});

// 現在のログイン状態を確認する
app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = db.getUserById(req.session.userId);
  res.json({ user: user ? db.publicUser(user) : null });
});

// 問題に正解したときに記録する（未ログインなら何もしない）
app.post('/api/problems/:id/solve', (req, res) => {
  if (!req.session.userId) {
    return res.json({ ok: false, reason: 'not_logged_in' });
  }
  const problemId = Number(req.params.id);
  if (!problemId) {
    return res.status(400).json({ ok: false, error: 'invalid problem id' });
  }
  db.markSolved(req.session.userId, problemId);
  res.json({ ok: true });
});

// バッジ表示用: 自分が解いた問題IDの一覧
app.get('/api/solved-ids', (req, res) => {
  if (!req.session.userId) {
    return res.json({ solvedIds: [] });
  }
  res.json({ solvedIds: db.getSolvedProblemIds(req.session.userId) });
});

// 履歴ページ用: 解いた日時つきの一覧
app.get('/api/history', (req, res) => {
  if (!req.session.userId) {
    return res.json({ history: [] });
  }
  res.json({ history: db.getSolvedHistory(req.session.userId) });
});

// ログアウト
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`CodeDrill server is running on port ${PORT}`);
});
