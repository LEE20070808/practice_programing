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
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn('警告: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI のいずれかが未設定です。.envまたはRenderの環境変数を確認してください。');
}

if (!ANTHROPIC_API_KEY) {
  console.warn('警告: ANTHROPIC_API_KEY が未設定です。AIレビュー機能は動作しません。');
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

// 現在のログイン状態を確認する（ここで日付が変わっていればストリークも更新する）
app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = db.touchLoginStreak(req.session.userId);
  if (!user) {
    return res.json({ user: null });
  }
  res.json({ user: db.publicUser(user) });
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

// 初回ログイン時のスライドを見終わったことを記録する
app.post('/api/onboarding/complete', (req, res) => {
  if (!req.session.userId) {
    return res.json({ ok: false });
  }
  db.markOnboardingSeen(req.session.userId);
  res.json({ ok: true });
});

// 書いたコードをClaudeに送り、改善版のコードとプロンプトのヒントをもらう
app.post('/api/ai-review', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'サーバー側でAI機能が設定されていません（管理者に確認してください）' });
  }

  const { problemId, code, language, title } = req.body;
  if (!problemId || typeof code !== 'string') {
    return res.status(400).json({ error: 'problemId と code が必要です' });
  }

  // 送信するコードが長すぎないように上限を設ける
  const trimmedCode = code.slice(0, 4000);
  const languageLabel = language === 'python' ? 'Python' : language === 'go' ? 'Go' : 'JavaScript';

  const prompt = `あなたはプログラミング学習サイト「CodeDrill」のAIレビュアーです。
このサイトの目的は、AIを使ってコードを書く際に「良いプロンプト（指示文）の書き方」を身につけてもらうことです。

以下は、学習者が書いた${languageLabel}のコードです（問題: 「${title || `問題ID ${problemId}`}」）。
このコードの言語は必ず ${languageLabel} です。改善案も必ず ${languageLabel} のまま書いてください。他の言語に書き換えないでください。

---
${trimmedCode}
---

次の3つを、日本語で、必ず次のJSON形式のみで出力してください（前後に説明文や\`\`\`は付けないでください）:

{
  "improvedCode": "${languageLabel}で、より良い書き方に改善したコード全体（文字列。改行は\\nで表現）",
  "promptHint": "この改善されたコードをAIに書いてもらうには、どんなプロンプトを書くと良いか、具体例を1つ",
  "explanation": "元のコードと比べて何がどう改善されたのか、簡潔な説明（2〜3文）"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic APIエラー:', response.status, errText);
      return res.status(502).json({ error: 'AIの呼び出しに失敗しました' });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((c) => c.type === 'text');
    const rawText = textBlock ? textBlock.text : '';

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // JSON形式で返ってこなかった場合は、そのまま説明文として渡す
      parsed = { improvedCode: '', promptHint: '', explanation: rawText };
    }

    res.json(parsed);
  } catch (err) {
    console.error('AIレビューエラー:', err);
    res.status(500).json({ error: 'AIレビュー中にエラーが発生しました' });
  }
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
