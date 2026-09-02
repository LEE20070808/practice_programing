// 問題データ一覧。問題を増やすときはこの配列に追加するだけでOK。

const PROBLEMS = [
  {
    id: 1,
    language: 'javascript',
    type: 'dom',
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
      "document.getElementById('colorBtn').addEventListener('click', () => {\n\n});",
    test: `
function runTest() {
  const btn = document.getElementById('colorBtn');
  const title = document.getElementById('title');
  if (!btn || !title) return { passed: false, message: '必要な要素が見つかりません。' };
  btn.click();
  const color = getComputedStyle(title).color;
  if (color === 'rgb(242, 169, 80)') {
    return { passed: true, message: 'ボタンを押すと見出しの色が変わりました。' };
  }
  return { passed: false, message: '見出しの色が #f2a950 になっていません。' };
}
`
  },
  {
    id: 2,
    language: 'javascript',
    type: 'dom',
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
      "let isOn = false;\n" +
      "document.getElementById('toggleBtn').addEventListener('click', () => {\n\n});",
    test: `
function runTest() {
  const btn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');
  if (!btn || !status) return { passed: false, message: '必要な要素が見つかりません。' };
  btn.click();
  const afterFirst = status.textContent.trim();
  btn.click();
  const afterSecond = status.textContent.trim();
  if (afterFirst === 'オン' && afterSecond === 'オフ') {
    return { passed: true, message: 'クリックのたびに正しく切り替わりました。' };
  }
  return { passed: false, message: '「オン」「オフ」の切り替えが正しくありません（1回目: ' + afterFirst + ' / 2回目: ' + afterSecond + '）。' };
}
`
  },
  {
    id: 3,
    language: 'javascript',
    type: 'dom',
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
      "let count = 0;\n" +
      "document.getElementById('countBtn').addEventListener('click', () => {\n\n});",
    test: `
function runTest() {
  const btn = document.getElementById('countBtn');
  const count = document.getElementById('count');
  if (!btn || !count) return { passed: false, message: '必要な要素が見つかりません。' };
  btn.click();
  btn.click();
  btn.click();
  const value = count.textContent.trim();
  if (value === '3') {
    return { passed: true, message: '3回クリックして「3」と表示されました。' };
  }
  return { passed: false, message: '3回クリック後の表示が「3」になっていません（現在: ' + value + '）。' };
}
`
  },
  {
    id: 4,
    language: 'javascript',
    type: 'dom',
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
      "document.getElementById('nameInput').addEventListener('input', (e) => {\n\n});",
    test: `
function runTest() {
  const input = document.getElementById('nameInput');
  const preview = document.getElementById('preview');
  if (!input || !preview) return { passed: false, message: '必要な要素が見つかりません。' };
  input.value = '太郎';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const text = preview.textContent.trim();
  if (text === 'こんにちは、太郎さん') {
    return { passed: true, message: '入力に合わせて正しく表示が変わりました。' };
  }
  return { passed: false, message: '表示が「こんにちは、太郎さん」になっていません（現在: ' + text + '）。' };
}
`
  },
  {
    id: 5,
    language: 'javascript',
    type: 'dom',
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
      "document.getElementById('showToggle').addEventListener('change', (e) => {\n\n});",
    test: `
function runTest() {
  const checkbox = document.getElementById('showToggle');
  const detail = document.getElementById('detail');
  if (!checkbox || !detail) return { passed: false, message: '必要な要素が見つかりません。' };
  checkbox.checked = true;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  const shown = getComputedStyle(detail).display !== 'none';
  checkbox.checked = false;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  const hidden = getComputedStyle(detail).display === 'none';
  if (shown && hidden) {
    return { passed: true, message: 'チェックのオン・オフで表示が正しく切り替わりました。' };
  }
  return { passed: false, message: '表示・非表示の切り替えが正しくありません。' };
}
`
  },
  {
    id: 6,
    language: 'javascript',
    type: 'dom',
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
      "document.getElementById('addBtn').addEventListener('click', () => {\n\n});",
    test: `
function runTest() {
  const input = document.getElementById('itemInput');
  const btn = document.getElementById('addBtn');
  const list = document.getElementById('itemList');
  if (!input || !btn || !list) return { passed: false, message: '必要な要素が見つかりません。' };
  input.value = 'タスクA';
  btn.click();
  const items = list.querySelectorAll('li');
  if (items.length === 1 && items[0].textContent.trim() === 'タスクA' && input.value === '') {
    return { passed: true, message: 'リストに正しく追加され、入力欄もクリアされました。' };
  }
  return { passed: false, message: 'リストへの追加、または入力欄のクリアがうまくいっていません。' };
}
`
  },
  {
    id: 7,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '二つの数の和',
    summary: '標準入力から2つの整数を受け取り、その和を出力するAtCoder形式の問題です。',
    statement:
      '標準入力から、半角スペース区切りで2つの整数 A, B が1行で与えられます。' +
      'A + B の値を1行で出力してください。',
    constraints: '1 ≤ A, B ≤ 1000',
    samples: [
      { input: '3 5', output: '8' },
      { input: '10 20', output: '30' }
    ],
    testCases: [
      { input: '3 5', output: '8' },
      { input: '10 20', output: '30' },
      { input: '1 1', output: '2' },
      { input: '999 1', output: '1000' }
    ],
    starter: ''
  },
  {
    id: 8,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '偶数か奇数か',
    summary: '標準入力から整数を受け取り、偶数か奇数かを判定するAtCoder形式の問題です。',
    statement:
      '標準入力から整数 N が1行で与えられます。' +
      'Nが偶数なら <code>Even</code>、奇数なら <code>Odd</code> と出力してください。',
    constraints: '1 ≤ N ≤ 1000000000',
    samples: [
      { input: '4', output: 'Even' },
      { input: '7', output: 'Odd' }
    ],
    testCases: [
      { input: '4', output: 'Even' },
      { input: '7', output: 'Odd' },
      { input: '1', output: 'Odd' },
      { input: '1000000000', output: 'Even' }
    ],
    starter: ''
  },
  {
    id: 9,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力/ループ',
    difficulty: '中級',
    title: '1からNまでの和',
    summary: 'ループ処理を使って合計値を求める、AtCoder形式の問題です。',
    statement:
      '標準入力から整数 N が1行で与えられます。' +
      '1からNまでの整数の総和を出力してください。',
    constraints: '1 ≤ N ≤ 100000',
    samples: [
      { input: '5', output: '15' },
      { input: '1', output: '1' }
    ],
    testCases: [
      { input: '5', output: '15' },
      { input: '1', output: '1' },
      { input: '10', output: '55' },
      { input: '100', output: '5050' }
    ],
    starter: ''
  },
  {
    id: 10,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '三つの数の最大値',
    summary: '標準入力から3つの整数を受け取り、その中で最も大きいものを出力します。',
    statement:
      '標準入力から、半角スペース区切りで3つの整数 A, B, C が1行で与えられます。' +
      'この3つの中で最も大きい値を1行で出力してください。',
    constraints: '1 ≤ A, B, C ≤ 1000',
    samples: [
      { input: '3 9 5', output: '9' },
      { input: '10 2 7', output: '10' }
    ],
    testCases: [
      { input: '3 9 5', output: '9' },
      { input: '10 2 7', output: '10' },
      { input: '1 1 1', output: '1' },
      { input: '100 100 99', output: '100' }
    ],
    starter: ''
  },
  {
    id: 11,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '文字列をくり返す',
    summary: '文字列と回数を受け取り、その回数だけつなげた文字列を出力します。',
    statement:
      '1行目に文字列 S、2行目に整数 N が与えられます。' +
      'S を N 回くり返してつなげた文字列を、1行で出力してください。<br><br>' +
      '例えば S が <code>abc</code>、N が <code>3</code> のとき、答えは <code>abcabcabc</code> です。',
    constraints: '1 ≤ Sの長さ ≤ 20、1 ≤ N ≤ 10',
    samples: [
      { input: 'abc\n3', output: 'abcabcabc' },
      { input: 'x\n1', output: 'x' }
    ],
    testCases: [
      { input: 'abc\n3', output: 'abcabcabc' },
      { input: 'x\n1', output: 'x' },
      { input: 'hi\n5', output: 'hihihihihi' },
      { input: 'ab\n2', output: 'abab' }
    ],
    starter: ''
  },
  {
    id: 12,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: 'N個の整数の合計',
    summary: '複数の整数をまとめて受け取り、その合計を出力します。',
    statement:
      '1行目に整数 N が与えられます。' +
      '2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'これらすべての合計を1行で出力してください。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '3\n1 2 3', output: '6' },
      { input: '5\n10 20 30 40 50', output: '150' }
    ],
    testCases: [
      { input: '3\n1 2 3', output: '6' },
      { input: '5\n10 20 30 40 50', output: '150' },
      { input: '1\n7', output: '7' },
      { input: '4\n0 0 0 0', output: '0' }
    ],
    starter: ''
  },
  {
    id: 13,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '商と余り',
    summary: '割り算の商と余りを求めます。整数どうしの割り算の書き方を覚える問題です。',
    statement:
      '標準入力から、半角スペース区切りで2つの整数 A, B が1行で与えられます。' +
      'A を B で割ったときの商と余りを、半角スペース区切りで1行に出力してください。<br><br>' +
      '例えば A が <code>7</code>、B が <code>3</code> のとき、商は <code>2</code>、余りは <code>1</code> なので <code>2 1</code> と出力します。',
    constraints: '1 ≤ A ≤ 1000、1 ≤ B ≤ 1000',
    samples: [
      { input: '7 3', output: '2 1' },
      { input: '10 5', output: '2 0' }
    ],
    testCases: [
      { input: '7 3', output: '2 1' },
      { input: '10 5', output: '2 0' },
      { input: '1 2', output: '0 1' },
      { input: '100 7', output: '14 2' }
    ],
    starter: ''
  },
  {
    id: 14,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '大文字に変換する',
    summary: '受け取った文字列をすべて大文字にして出力します。',
    statement:
      '標準入力から文字列 S が1行で与えられます。' +
      'S に含まれるアルファベットをすべて大文字にして、1行で出力してください。' +
      '数字などアルファベット以外の文字は、そのまま出力します。',
    constraints: '1 ≤ Sの長さ ≤ 50',
    samples: [
      { input: 'hello', output: 'HELLO' },
      { input: 'CodeDrill', output: 'CODEDRILL' }
    ],
    testCases: [
      { input: 'hello', output: 'HELLO' },
      { input: 'CodeDrill', output: 'CODEDRILL' },
      { input: 'a', output: 'A' },
      { input: 'abc123', output: 'ABC123' }
    ],
    starter: ''
  },
  {
    id: 15,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '平均値を小数第2位まで',
    summary: '整数の平均を求め、小数第2位までの形式で出力します。出力の書式を整える練習です。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'これらの平均値を、<strong>小数第2位まで</strong>の形式で1行に出力してください。<br><br>' +
      '例えば平均が 2 のときは <code>2.00</code>、2.75 のときは <code>2.75</code> と出力します。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '3\n1 2 3', output: '2.00' },
      { input: '4\n1 2 3 5', output: '2.75' }
    ],
    testCases: [
      { input: '3\n1 2 3', output: '2.00' },
      { input: '4\n1 2 3 5', output: '2.75' },
      { input: '2\n10 5', output: '7.50' },
      { input: '5\n1 1 1 1 2', output: '1.20' }
    ],
    starter: ''
  },
  {
    id: 16,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '最大値は何番目か',
    summary: 'リストの中で最も大きい値が何番目にあるかを求めます。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'この中で最も大きい値が<strong>何番目</strong>にあるかを、1行で出力してください。' +
      '先頭を1番目と数えます。<br><br>' +
      '最大値が複数ある場合は、<strong>最も前にあるもの</strong>の位置を答えてください。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n3 1 4 1 5', output: '5' },
      { input: '3\n10 2 7', output: '1' }
    ],
    testCases: [
      { input: '5\n3 1 4 1 5', output: '5' },
      { input: '3\n10 2 7', output: '1' },
      { input: '4\n1 9 9 2', output: '2' },
      { input: '1\n42', output: '1' }
    ],
    starter: ''
  },
  {
    id: 17,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '回文かどうか',
    summary: '前から読んでも後ろから読んでも同じ文字列かを判定します。',
    statement:
      '標準入力から文字列 S が1行で与えられます。' +
      'S が回文（前から読んでも後ろから読んでも同じ）であれば <code>Yes</code>、' +
      'そうでなければ <code>No</code> と1行で出力してください。<br><br>' +
      '例えば <code>level</code> は回文なので <code>Yes</code>、<code>hello</code> は回文ではないので <code>No</code> です。',
    constraints: '1 ≤ Sの長さ ≤ 100（Sは英小文字のみ）',
    samples: [
      { input: 'level', output: 'Yes' },
      { input: 'hello', output: 'No' }
    ],
    testCases: [
      { input: 'level', output: 'Yes' },
      { input: 'hello', output: 'No' },
      { input: 'a', output: 'Yes' },
      { input: 'abba', output: 'Yes' }
    ],
    starter: ''
  },
  {
    id: 18,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '3または5の倍数の合計',
    summary: '1からNまでの中で、条件に当てはまる数だけを合計します。',
    statement:
      '標準入力から整数 N が1行で与えられます。' +
      '1 以上 N 以下の整数のうち、<strong>3の倍数または5の倍数</strong>であるものすべての合計を、1行で出力してください。<br><br>' +
      '例えば N が 10 のとき、対象は 3, 5, 6, 9, 10 なので、合計は 33 です。',
    constraints: '1 ≤ N ≤ 100000',
    samples: [
      { input: '10', output: '33' },
      { input: '3', output: '3' }
    ],
    testCases: [
      { input: '10', output: '33' },
      { input: '3', output: '3' },
      { input: '15', output: '60' },
      { input: '100', output: '2418' }
    ],
    starter: ''
  },
  {
    id: 19,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: 'いちばん多い文字',
    summary: '文字列の中で最も多く登場する文字を求めます。数え上げの練習です。',
    statement:
      '標準入力から文字列 S が1行で与えられます。' +
      'S の中で<strong>最も多く登場する文字</strong>を1行で出力してください。<br><br>' +
      '最も多い文字が複数ある場合は、その中で<strong>アルファベット順で最も早いもの</strong>を出力してください。' +
      '例えば <code>abc</code> はすべて1回ずつなので、答えは <code>a</code> です。',
    constraints: '1 ≤ Sの長さ ≤ 100（Sは英小文字のみ）',
    samples: [
      { input: 'aabbbcc', output: 'b' },
      { input: 'abc', output: 'a' }
    ],
    testCases: [
      { input: 'aabbbcc', output: 'b' },
      { input: 'abc', output: 'a' },
      { input: 'zzzyy', output: 'z' },
      { input: 'banana', output: 'a' }
    ],
    starter: ''
  },
];
