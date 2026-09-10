require('dotenv').config();

const rateLimit = require('express-rate-limit');
const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSessionFactory = require('connect-pg-simple');
const { OAuth2Client } = require('google-auth-library');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // 例: https://example.com/auth/google/callback
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.warn('警告: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI のいずれかが未設定です。.envを確認してください。');
}

if (!ANTHROPIC_API_KEY) {
  console.warn('警告: ANTHROPIC_API_KEY が未設定です。AIレビュー機能は動作しません。');
}

if (!process.env.DATABASE_URL) {
  console.warn('警告: DATABASE_URL が未設定です。.envを確認してください。');
}

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
const PgSession = pgSessionFactory(session);

// リバースプロキシ(nginxなど)経由でも req.protocol が https と正しく判定されるようにする
app.set('trust proxy', 1);

app.use(express.json());

app.use(session({
  store: new PgSession({ pool: db.pool, createTableIfMissing: true }),
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

app.use(express.static(path.join(__dirname, 'public')));

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

    const user = await db.upsertUser({
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
app.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = await db.touchLoginStreak(req.session.userId);
  if (!user) {
    return res.json({ user: null });
  }
  // プランと今日の使用状況も返す（画面に「残り○回」を出したいときに使える）
  const tier = await resolveAiTier(user.id);
  const usedToday = await db.getAiUsageToday(user.id);
  res.json({
    user: db.publicUser(user),
    plan: tier.name,
    aiReview: {
      usedToday,
      dailyLimit: tier.dailyLimit,
      remaining: Math.max(0, tier.dailyLimit - usedToday),
      canRevealCode: !!tier.canRevealCode
    }
  });
});

// AIレビュー: 短時間の連打を防ぐ（1人あたり1分に3回まで）
// こちらはメモリ上のカウントで十分（再起動でリセットされても実害がない）
const aiReviewBurstLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => String(req.session.userId),
  message: { error: '少し時間をおいてから、もう一度お試しください' }
});

// --- AIレビューのプラン設定 -------------------------------------------
// ここを書き換えるだけで、各プランのモデル・1日の上限・出力量を調整できる。
// 将来プランを売り始めたら、db.grantEntitlement(userId, 'ai:standard') を
// 呼ぶだけでそのユーザーが standard に上がる。
const AI_TIERS = {
  // 客ゼロ期間は全員この枠。課金UIは出さない。
  free: {
    model: 'claude-sonnet-5',
    dailyLimit: 15,
    maxTokens: 2048,
    canRevealCode: true
  },
  standard: {
    model: 'claude-sonnet-5',
    dailyLimit: 30,
    maxTokens: 2048,
    canRevealCode: true
  },
  pro: {
    model: 'claude-opus-5',
    dailyLimit: 30,
    maxTokens: 2048,
    canRevealCode: true
  }
};

// このユーザーが今どのプランかを判定する（上位のものから順に見る）
async function resolveAiTier(userId) {
  if (await db.hasEntitlement(userId, 'ai:pro')) {
    return { name: 'pro', ...AI_TIERS.pro };
  }
  if (await db.hasEntitlement(userId, 'ai:standard')) {
    return { name: 'standard', ...AI_TIERS.standard };
  }
  return { name: 'free', ...AI_TIERS.free };
}

// 問題に正解したときに記録する（未ログインなら何もしない）
app.post('/api/problems/:id/solve', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ ok: false, reason: 'not_logged_in' });
  }
  const problemId = Number(req.params.id);
  if (!problemId) {
    return res.status(400).json({ ok: false, error: 'invalid problem id' });
  }
  await db.markSolved(req.session.userId, problemId);
  res.json({ ok: true });
});

// バッジ表示用: 自分が解いた問題IDの一覧
app.get('/api/solved-ids', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ solvedIds: [] });
  }
  res.json({ solvedIds: await db.getSolvedProblemIds(req.session.userId) });
});

// 履歴ページ用: 解いた日時つきの一覧
app.get('/api/history', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ history: [] });
  }
  res.json({ history: await db.getSolvedHistory(req.session.userId) });
});

// 初回ログイン時のスライドを見終わったことを記録する
app.post('/api/onboarding/complete', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ ok: false });
  }
  await db.markOnboardingSeen(req.session.userId);
  res.json({ ok: true });
});

const REVIEW_AXES = {
  readable: '読みやすさ（名前、分割、重複、意図が追えるか）',
  robust: '壊れにくさ（入力検証、エラー、想定外の操作）',
  specific: '指示の具体性（言語・制約・入出力・やってはいけないことが書けているか）'
};

// 書いたコードと、学習者の次の指示文をClaudeに送り、弱点とプロンプトの穴を返す
app.post('/api/ai-review', aiReviewBurstLimiter, async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'サーバー側でAI機能が設定されていません（管理者に確認してください）' });
  }

  const { problemId, code, language, title, userPrompt, axis, revealCode } = req.body;
  if (!problemId || typeof code !== 'string') {
    return res.status(400).json({ error: 'problemId と code が必要です' });
  }

  const tier = await resolveAiTier(req.session.userId);
  const usedToday = await db.getAiUsageToday(req.session.userId);
  if (usedToday >= tier.dailyLimit) {
    return res.status(429).json({
      error: `本日のAIレビューの上限（${tier.dailyLimit}回）に達しました。また明日お試しください`,
      plan: tier.name,
      usedToday,
      dailyLimit: tier.dailyLimit
    });
  }

  const trimmedCode = code.slice(0, 4000);
  const trimmedPrompt = typeof userPrompt === 'string' ? userPrompt.slice(0, 2000) : '';
  const safeTitle = String(title || '').slice(0, 100);
  const axisKey = REVIEW_AXES[axis] ? axis : 'readable';
  const axisLabel = REVIEW_AXES[axisKey];
  const languageLabel = language === 'python' ? 'Python' : language === 'go' ? 'Go' : 'JavaScript';
  // 公開初期は改善コードも無料で返す。課金を始めるまで reveal 条件は使わない。
  const wantCode = true;

  const prompt = `あなたはプログラミング学習サイト「CodeDrill」のAIレビュアーです。
目的は「コードの正解」を教えることではなく、学習者がAIへ出す指示文（プロンプト）を良くすることです。
評価軸は1つだけです: ${axisLabel}
言語は必ず ${languageLabel} のまま扱ってください。他言語に書き換えないでください。

問題タイトル: ${safeTitle || `問題ID ${problemId}`}

学習者が貼ったコード:
---
${trimmedCode}
---

学習者が「次にAIへ出したい」と思っている指示文（空の場合もある）:
---
${trimmedPrompt || '（未入力）'}
---

次のJSON形式のみで日本語出力してください。前後に説明文や\`\`\`は付けないでください。
{
  "weakness": "この評価軸におけるコードの弱点を1つ。2文以内",
  "promptGap": "今の指示文に足りない点を1つ。未入力なら、この軸で最低限書くべき要素を1つ",
  "promptHint": "この軸で改善するためにAIへ出すべきプロンプト例を1つ（完成文）",
  "explanation": "弱点と指示の穴の関係を2文以内",
  "improvedCode": ${wantCode ? `"${languageLabel}の改善コード全体。改行は\\n"` : '""'}
}
improvedCode は ${wantCode ? '必ずコード全体を入れる' : '必ず空文字にする'}。`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: tier.model,
        max_tokens: tier.maxTokens,
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

    const cleanedText = rawText
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (e) {
      parsed = {
        weakness: '',
        promptGap: '',
        promptHint: '',
        explanation: rawText,
        improvedCode: ''
      };
    }

    if (!wantCode) {
      parsed.improvedCode = '';
    }

    const newCount = await db.incrementAiUsage(req.session.userId);

    await db.savePromptReview({
      userId: req.session.userId,
      problemId: Number(problemId),
      language: languageLabel,
      axis: axisKey,
      code: trimmedCode,
      userPrompt: trimmedPrompt,
      weakness: parsed.weakness || '',
      promptGap: parsed.promptGap || '',
      promptHint: parsed.promptHint || '',
      explanation: parsed.explanation || '',
      improvedCode: parsed.improvedCode || '',
      revealedCode: wantCode
    });

    res.json({
      weakness: parsed.weakness || '',
      promptGap: parsed.promptGap || '',
      promptHint: parsed.promptHint || '',
      explanation: parsed.explanation || '',
      improvedCode: parsed.improvedCode || '',
      axis: axisKey,
      canRevealCode: !!tier.canRevealCode,
      codeLocked: !wantCode,
      plan: tier.name,
      usedToday: newCount,
      dailyLimit: tier.dailyLimit,
      remaining: Math.max(0, tier.dailyLimit - newCount)
    });
  } catch (err) {
    console.error('AIレビューエラー:', err);
    res.status(500).json({ error: 'AIレビュー中にエラーが発生しました' });
  }
});

app.get('/api/prompt-history', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ history: [] });
  }
  res.json({ history: await db.getPromptReviewHistory(req.session.userId) });
});

// ログアウト
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

async function start() {
  await db.initDb();
  app.listen(PORT, () => {
    console.log(`CodeDrill server is running on port ${PORT}`);
  });
}

start();