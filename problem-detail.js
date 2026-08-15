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
  },
  {
    id: 4,
    tag: 'JavaScript ・ フォーム',
    difficulty: '初級',
    title: '入力した文字をリアルタイムで表示する',
    summary: 'inputイベントを使って、入力内容を即座に画面へ反映する練習です。',
    description:
      '入力欄 <code>#nameInput</code> に文字を入力するたびに、段落 <code>#preview</code> の内容を' +
      '「こんにちは、〇〇さん」（〇〇には入力した文字）に書き換えてください。',
    html:
      '<div class="demo-card">\n' +
      '  <input id="nameInput" type="text" placeholder="名前を入力">\n' +
      '  <p id="preview">こんにちは、ゲストさん</p>\n' +
      '</div>',
    starter:
      "// ここにコードを書いてください\n" +
      "document.getElementById('nameInput').addEventListener('input', (e) => {\n\n});"
  },
  {
    id: 5,
    tag: 'JavaScript ・ DOM操作',
    difficulty: '初級',
    title: 'チェックボックスで詳細の表示・非表示を切り替える',
    summary: 'checkboxの状態に応じて要素の表示・非表示を切り替える練習です。',
    description:
      'チェックボックス <code>#showToggle</code> をオン・オフすることで、段落 <code>#detail</code> の' +
      '表示・非表示（<code>display: block</code> / <code>display: none</code>）を切り替えてください。',
    html:
      '<div class="demo-card">\n' +
      '  <label><input type="checkbox" id="showToggle"> 詳細を表示</label>\n' +
      '  <p id="detail" style="display:none;">これは詳細情報です。</p>\n' +
      '</div>',
    starter:
      "// ここにコードを書いてください\n" +
      "document.getElementById('showToggle').addEventListener('change', (e) => {\n\n});"
  },
  {
    id: 6,
    tag: 'JavaScript ・ 配列/DOM生成',
    difficulty: '上級',
    title: 'リストにアイテムを追加する',
    summary: '入力内容から新しい要素を作り、リストに追加していく練習です。',
    description:
      '入力欄 <code>#itemInput</code> に文字を入力してボタン <code>#addBtn</code> を押すと、' +
      'その文字を新しい <code>&lt;li&gt;</code> として <code>#itemList</code> に追加してください。' +
      '追加後は入力欄を空にしてください。',
    html:
      '<div class="demo-card">\n' +
      '  <input id="itemInput" type="text" placeholder="タスクを入力">\n' +
      '  <button id="addBtn">追加</button>\n' +
      '  <ul id="itemList"></ul>\n' +
      '</div>',
    starter:
      "// ここにコードを書いてください\n" +
      "document.getElementById('addBtn').addEventListener('click', () => {\n\n});"
  }
];
