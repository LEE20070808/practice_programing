require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn('警告: GOOGLE_CLIENT_ID が設定されていません。.envを確認してください。');
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// フロントに渡してよい設定値（Client IDは公開情報なので問題ない）
app.get('/api/config', (req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID });
});

// Googleから受け取ったIDトークンをサーバー側で検証し、ログイン状態を作る
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
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
    res.json({ user: db.publicUser(user) });
  } catch (err) {
    console.error('Google認証エラー:', err);
    res.status(401).json({ error: 'Googleログインの検証に失敗しました' });
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
