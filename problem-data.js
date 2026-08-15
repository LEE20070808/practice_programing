// 問題データ一覧。問題を増やすときはこの配列に追加するだけでOK。

const PROBLEMS = [
  {
    id: 1,
    tag: 'JavaScript ・ DOM操作',
    difficulty: '初級',
    title: 'ボタンで見出しの色を変える',
    summary: 'クリックイベントを使って要素のスタイルを変更する練習です。',
    description:
      '下記のHTMLには、見出し <code>#title</code> とボタン <code>#colorBtn</code> があります。<br><br>' +
      'ボタンをクリックすると、見出しの文字色が <strong style="color:var(--accent-strong)">#f2a950</strong> に変わるようなJavaScriptを書いてください。',
    html:
      '<div class="demo-card">\n' +
      '  <h1 id="title">Hello, Learner!</h1>\n' +
      '  <button id="colorBtn">色を変える</button>\n' +
      '</div>',
    starter:
      "// ここにコードを書いてください\n" +
      "document.getElementById('colorBtn').addEventListener('click', () => {\n\n});"
  },
  {
    id: 2,
    tag: 'JavaScript ・ DOM操作',
    difficulty: '初級',
    title: 'ボタンでテキストを切り替える',
    summary: 'クリックのたびに文字列を書き換える練習です。',
    description:
      'ボタン <code>#toggleBtn</code> を押すたびに、見出し <code>#status</code> の文字を' +
      '「オフ」と「オン」で交互に切り替えてください。',
    html:
      '<div class="demo-card">\n' +
      '  <h1 id="status">オフ</h1>\n' +
      '  <button id="toggleBtn">切り替える</button>\n' +
      '</div>',
    starter:
      "// ここにコードを書いてください\n" +
      "let isOn = false;\n" +
      "document.getElementById('toggleBtn').addEventListener('click', () => {\n\n});"
  },
  {
    id: 3,
    tag: 'JavaScript ・ イベント処理',
    difficulty: '中級',
    title: 'クリック回数をカウントする',
    summary: 'クリック回数を変数で保持し、画面に反映する練習です。',
    description:
      'ボタン <code>#countBtn</code> を押すたびに、見出し <code>#count</code> の数字を' +
      '1つずつ増やして表示してください。',
    html:
      '<div class="demo-card">\n' +
      '  <h1 id="count">0</h1>\n' +
      '  <button id="countBtn">カウントする</button>\n' +
      '</div>',
    starter:
      "// ここにコードを書いてください\n" +
      "let count = 0;\n" +
      "document.getElementById('countBtn').addEventListener('click', () => {\n\n});"
  }
];