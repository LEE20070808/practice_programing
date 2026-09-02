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
  {
    id: 20,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '秒を分と秒に直す',
    summary: '割り算の商と余りを使って、秒数を「何分何秒」に変換します。',
    statement:
      '標準入力から整数 N（秒数）が1行で与えられます。' +
      'これを「何分何秒」に直して、分と秒を半角スペース区切りで1行に出力してください。<br><br>' +
      '例えば N が <code>125</code> のとき、125秒は2分5秒なので <code>2 5</code> と出力します。',
    constraints: '0 ≤ N ≤ 100000',
    samples: [
      { input: '125', output: '2 5' },
      { input: '60', output: '1 0' }
    ],
    testCases: [
      { input: '125', output: '2 5' },
      { input: '60', output: '1 0' },
      { input: '59', output: '0 59' },
      { input: '3661', output: '61 1' }
    ],
    starter: ''
  },
  {
    id: 21,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '文字列を逆さまにする',
    summary: '受け取った文字列を逆順にして出力します。スライスの練習です。',
    statement:
      '標準入力から文字列 S が1行で与えられます。' +
      'S を逆から並べた文字列を、1行で出力してください。<br><br>' +
      '例えば S が <code>hello</code> のとき、答えは <code>olleh</code> です。',
    constraints: '1 ≤ Sの長さ ≤ 100（Sは英小文字のみ）',
    samples: [
      { input: 'hello', output: 'olleh' },
      { input: 'abc', output: 'cba' }
    ],
    testCases: [
      { input: 'hello', output: 'olleh' },
      { input: 'abc', output: 'cba' },
      { input: 'a', output: 'a' },
      { input: 'codedrill', output: 'llirdedoc' }
    ],
    starter: ''
  },
  {
    id: 22,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '2つの数の差',
    summary: '2つの整数の差を、マイナスにならない形で出力します。',
    statement:
      '標準入力から、半角スペース区切りで2つの整数 A, B が1行で与えられます。' +
      'A と B の差を出力してください。ただし答えは<strong>必ず0以上</strong>になるようにします。<br><br>' +
      '例えば A が <code>3</code>、B が <code>8</code> のとき、答えは <code>5</code> です。',
    constraints: '1 ≤ A, B ≤ 1000',
    samples: [
      { input: '3 8', output: '5' },
      { input: '10 4', output: '6' }
    ],
    testCases: [
      { input: '3 8', output: '5' },
      { input: '10 4', output: '6' },
      { input: '7 7', output: '0' },
      { input: '1 1000', output: '999' }
    ],
    starter: ''
  },
  {
    id: 23,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '合計は偶数か奇数か',
    summary: '2つの数を足した結果が偶数か奇数かを判定します。',
    statement:
      '標準入力から、半角スペース区切りで2つの整数 A, B が1行で与えられます。' +
      'A + B が偶数なら <code>Even</code>、奇数なら <code>Odd</code> と1行で出力してください。',
    constraints: '1 ≤ A, B ≤ 1000',
    samples: [
      { input: '3 5', output: 'Even' },
      { input: '2 5', output: 'Odd' }
    ],
    testCases: [
      { input: '3 5', output: 'Even' },
      { input: '2 5', output: 'Odd' },
      { input: '1 1', output: 'Even' },
      { input: '100 7', output: 'Odd' }
    ],
    starter: ''
  },
  {
    id: 24,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '初級',
    title: '文字が何個あるか',
    summary: '文字列の中に、指定された文字がいくつ含まれるかを数えます。',
    statement:
      '1行目に文字列 S、2行目に1文字 C が与えられます。' +
      'S の中に C が何個含まれるかを、1行で出力してください。<br><br>' +
      '例えば S が <code>banana</code>、C が <code>a</code> のとき、答えは <code>3</code> です。' +
      '1個も含まれない場合は <code>0</code> と出力します。',
    constraints: '1 ≤ Sの長さ ≤ 100（S, C は英小文字のみ）',
    samples: [
      { input: 'banana\na', output: '3' },
      { input: 'hello\nl', output: '2' }
    ],
    testCases: [
      { input: 'banana\na', output: '3' },
      { input: 'hello\nl', output: '2' },
      { input: 'abc\nz', output: '0' },
      { input: 'aaaa\na', output: '4' }
    ],
    starter: ''
  },
  {
    id: 25,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '最小値と最大値',
    summary: 'リストの中で最も小さい値と最も大きい値を、まとめて出力します。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'この中の<strong>最小値と最大値</strong>を、この順で半角スペース区切りで1行に出力してください。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n3 1 4 1 5', output: '1 5' },
      { input: '3\n10 2 7', output: '2 10' }
    ],
    testCases: [
      { input: '5\n3 1 4 1 5', output: '1 5' },
      { input: '3\n10 2 7', output: '2 10' },
      { input: '1\n42', output: '42 42' },
      { input: '4\n8 8 8 8', output: '8 8' }
    ],
    starter: ''
  },
  {
    id: 26,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '単語の数を数える',
    summary: 'スペースで区切られた文の中に、単語がいくつあるかを数えます。',
    statement:
      '標準入力から、半角スペースで区切られた英単語の列が1行で与えられます。' +
      '単語がいくつあるかを、1行で出力してください。<br><br>' +
      '例えば <code>I love python</code> のとき、単語は3つなので <code>3</code> と出力します。',
    constraints: '1 ≤ 全体の長さ ≤ 200、単語数は1以上',
    samples: [
      { input: 'I love python', output: '3' },
      { input: 'hello', output: '1' }
    ],
    testCases: [
      { input: 'I love python', output: '3' },
      { input: 'hello', output: '1' },
      { input: 'a b c d e', output: '5' },
      { input: 'one two', output: '2' }
    ],
    starter: ''
  },
  {
    id: 27,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '九九の段を出力する',
    summary: '複数行にわたって出力する練習です。ループの基本を確認します。',
    statement:
      '標準入力から整数 N が1行で与えられます。' +
      'N の段の九九、つまり N×1 から N×9 までの結果を、<strong>1行に1つずつ、9行にわたって</strong>出力してください。<br><br>' +
      '例えば N が <code>3</code> のとき、<code>3</code>、<code>6</code>、<code>9</code> …と <code>27</code> まで9行出力します。',
    constraints: '1 ≤ N ≤ 9',
    samples: [
      { input: '3', output: '3\n6\n9\n12\n15\n18\n21\n24\n27' },
      { input: '1', output: '1\n2\n3\n4\n5\n6\n7\n8\n9' }
    ],
    testCases: [
      { input: '3', output: '3\n6\n9\n12\n15\n18\n21\n24\n27' },
      { input: '1', output: '1\n2\n3\n4\n5\n6\n7\n8\n9' },
      { input: '9', output: '9\n18\n27\n36\n45\n54\n63\n72\n81' },
      { input: '5', output: '5\n10\n15\n20\n25\n30\n35\n40\n45' }
    ],
    starter: ''
  },
  {
    id: 28,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '基準以上の個数',
    summary: '条件に当てはまる要素だけを数えます。ループと条件分岐の組み合わせです。',
    statement:
      '1行目に整数 N と K が半角スペース区切りで与えられます。' +
      '2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'この中で <strong>K 以上</strong>のものがいくつあるかを、1行で出力してください。<br><br>' +
      '例えば N=5, K=3 で数列が <code>1 2 3 4 5</code> のとき、3以上は 3, 4, 5 の3つなので <code>3</code> と出力します。',
    constraints: '1 ≤ N ≤ 100、0 ≤ K ≤ 1000、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5 3\n1 2 3 4 5', output: '3' },
      { input: '3 10\n1 2 3', output: '0' }
    ],
    testCases: [
      { input: '5 3\n1 2 3 4 5', output: '3' },
      { input: '3 10\n1 2 3', output: '0' },
      { input: '4 1\n1 1 1 1', output: '4' },
      { input: '6 50\n10 50 90 30 70 50', output: '4' }
    ],
    starter: ''
  },
  {
    id: 29,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '種類はいくつあるか',
    summary: '同じ値をまとめて数えると何種類になるかを求めます。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'この中に<strong>何種類</strong>の数があるかを、1行で出力してください。' +
      '同じ数が何回出てきても、1種類として数えます。<br><br>' +
      '例えば <code>1 2 2 3 3</code> のとき、種類は 1, 2, 3 の3つなので <code>3</code> と出力します。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n1 2 2 3 3', output: '3' },
      { input: '4\n1 1 1 1', output: '1' }
    ],
    testCases: [
      { input: '5\n1 2 2 3 3', output: '3' },
      { input: '4\n1 1 1 1', output: '1' },
      { input: '3\n5 6 7', output: '3' },
      { input: '6\n1 2 3 1 2 3', output: '3' }
    ],
    starter: ''
  },
  {
    id: 30,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '数列を逆順にする',
    summary: '受け取った数列を逆から並べ直して出力します。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'これらを<strong>逆の順番</strong>にして、半角スペース区切りで1行に出力してください。<br><br>' +
      '例えば <code>1 2 3 4 5</code> のとき、答えは <code>5 4 3 2 1</code> です。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1' },
      { input: '3\n10 20 30', output: '30 20 10' }
    ],
    testCases: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1' },
      { input: '3\n10 20 30', output: '30 20 10' },
      { input: '1\n7', output: '7' },
      { input: '4\n1 1 2 2', output: '2 2 1 1' }
    ],
    starter: ''
  },
  {
    id: 31,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '母音の数を数える',
    summary: '文字列の中に母音がいくつ含まれるかを数えます。',
    statement:
      '標準入力から文字列 S が1行で与えられます。' +
      'S の中に含まれる母音（<code>a</code>, <code>i</code>, <code>u</code>, <code>e</code>, <code>o</code>）の個数を、1行で出力してください。<br><br>' +
      '例えば <code>hello</code> には <code>e</code> と <code>o</code> があるので、答えは <code>2</code> です。',
    constraints: '1 ≤ Sの長さ ≤ 100（Sは英小文字のみ）',
    samples: [
      { input: 'hello', output: '2' },
      { input: 'aeiou', output: '5' }
    ],
    testCases: [
      { input: 'hello', output: '2' },
      { input: 'aeiou', output: '5' },
      { input: 'xyz', output: '0' },
      { input: 'programming', output: '3' }
    ],
    starter: ''
  },
  {
    id: 32,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: 'FizzBuzz',
    summary: 'プログラミング学習で最も有名な問題のひとつです。条件分岐の順番がポイントになります。',
    statement:
      '標準入力から整数 N が1行で与えられます。' +
      '1 から N までの整数について、次のルールで<strong>1行に1つずつ</strong>出力してください。<br><br>' +
      '・3でも5でも割り切れるなら <code>FizzBuzz</code><br>' +
      '・3で割り切れるなら <code>Fizz</code><br>' +
      '・5で割り切れるなら <code>Buzz</code><br>' +
      '・どれでもなければ、その数をそのまま',
    constraints: '1 ≤ N ≤ 100',
    samples: [
      { input: '5', output: '1\n2\nFizz\n4\nBuzz' },
      { input: '3', output: '1\n2\nFizz' }
    ],
    testCases: [
      { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
      { input: '3', output: '1\n2\nFizz' },
      { input: '5', output: '1\n2\nFizz\n4\nBuzz' },
      { input: '1', output: '1' }
    ],
    starter: ''
  },
  {
    id: 33,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '2番目に大きい値',
    summary: '重複を除いたうえで、2番目に大きい値を求めます。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'この中で<strong>2番目に大きい値</strong>を1行で出力してください。<br><br>' +
      '同じ値が複数ある場合は<strong>1つとして数えます</strong>。' +
      '例えば <code>5 5 3 1</code> のとき、大きい順に 5, 3, 1 なので、答えは <code>3</code> です。',
    constraints: '2 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000（異なる値が2種類以上あることが保証されます）',
    samples: [
      { input: '5\n3 1 4 1 5', output: '4' },
      { input: '4\n5 5 3 1', output: '3' }
    ],
    testCases: [
      { input: '5\n3 1 4 1 5', output: '4' },
      { input: '3\n10 2 7', output: '7' },
      { input: '4\n5 5 3 1', output: '3' },
      { input: '2\n100 1', output: '1' }
    ],
    starter: ''
  },
  {
    id: 34,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '各桁の数字の合計',
    summary: '数を1桁ずつに分けて足し合わせます。文字列として扱うのがコツです。',
    statement:
      '標準入力から整数 N が1行で与えられます。' +
      'N の<strong>各桁の数字を合計した値</strong>を、1行で出力してください。<br><br>' +
      '例えば N が <code>123</code> のとき、1 + 2 + 3 = 6 なので <code>6</code> と出力します。',
    constraints: '1 ≤ N ≤ 1000000000',
    samples: [
      { input: '123', output: '6' },
      { input: '9', output: '9' }
    ],
    testCases: [
      { input: '123', output: '6' },
      { input: '9', output: '9' },
      { input: '1000', output: '1' },
      { input: '987654321', output: '45' }
    ],
    starter: ''
  },
  {
    id: 35,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '小さい順に並べ替える',
    summary: '数列を昇順に並べ替えて出力します。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'これらを<strong>小さい順</strong>に並べ替えて、半角スペース区切りで1行に出力してください。<br><br>' +
      '同じ値が複数あっても、そのまま全部出力します。',
    constraints: '1 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n3 1 4 1 5', output: '1 1 3 4 5' },
      { input: '3\n10 2 7', output: '2 7 10' }
    ],
    testCases: [
      { input: '5\n3 1 4 1 5', output: '1 1 3 4 5' },
      { input: '3\n10 2 7', output: '2 7 10' },
      { input: '1\n42', output: '42' },
      { input: '4\n4 3 2 1', output: '1 2 3 4' }
    ],
    starter: ''
  },
  {
    id: 36,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '中級',
    title: '指定した数はいくつあるか',
    summary: '数列の中に、特定の値が何回出てくるかを数えます。',
    statement:
      '1行目に整数 N と X が半角スペース区切りで与えられます。' +
      '2行目に N 個の整数が半角スペース区切りで与えられます。' +
      'この中に X が<strong>何個含まれるか</strong>を、1行で出力してください。' +
      '1個もない場合は <code>0</code> と出力します。',
    constraints: '1 ≤ N ≤ 100、0 ≤ X ≤ 1000、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5 2\n1 2 2 3 2', output: '3' },
      { input: '3 9\n1 2 3', output: '0' }
    ],
    testCases: [
      { input: '5 2\n1 2 2 3 2', output: '3' },
      { input: '3 9\n1 2 3', output: '0' },
      { input: '4 1\n1 1 1 1', output: '4' },
      { input: '6 50\n10 50 90 30 70 50', output: '2' }
    ],
    starter: ''
  },
  {
    id: 37,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '上級',
    title: '指定した区間の合計',
    summary: '数列の一部だけを取り出して合計します。入力が3行になる問題です。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      '3行目に整数 L と R が半角スペース区切りで与えられます。<br><br>' +
      '数列の<strong>L 番目から R 番目まで</strong>（両端を含む）の合計を、1行で出力してください。先頭を1番目と数えます。<br><br>' +
      '例えば数列が <code>1 2 3 4 5</code> で L=2, R=4 のとき、2 + 3 + 4 = 9 なので <code>9</code> と出力します。',
    constraints: '1 ≤ N ≤ 100、1 ≤ L ≤ R ≤ N、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n1 2 3 4 5\n2 4', output: '9' },
      { input: '3\n10 20 30\n1 3', output: '60' }
    ],
    testCases: [
      { input: '5\n1 2 3 4 5\n2 4', output: '9' },
      { input: '3\n10 20 30\n1 3', output: '60' },
      { input: '4\n1 1 1 1\n2 2', output: '1' },
      { input: '5\n5 4 3 2 1\n1 5', output: '15' }
    ],
    starter: ''
  },
  {
    id: 38,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '上級',
    title: '同じ文字が続く最大の長さ',
    summary: '連続して同じ文字が並んでいる部分のうち、最も長いものの長さを求めます。',
    statement:
      '標準入力から文字列 S が1行で与えられます。' +
      'S の中で<strong>同じ文字が連続している部分</strong>のうち、最も長いものの長さを1行で出力してください。<br><br>' +
      '例えば <code>aabbbcc</code> のとき、<code>bbb</code> が3文字で最長なので <code>3</code> と出力します。' +
      '同じ文字が1つも連続していない場合は <code>1</code> になります。',
    constraints: '1 ≤ Sの長さ ≤ 100（Sは英小文字のみ）',
    samples: [
      { input: 'aabbbcc', output: '3' },
      { input: 'abc', output: '1' }
    ],
    testCases: [
      { input: 'aabbbcc', output: '3' },
      { input: 'abc', output: '1' },
      { input: 'aaaa', output: '4' },
      { input: 'abbbba', output: '4' }
    ],
    starter: ''
  },
  {
    id: 39,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '上級',
    title: '両方に出てくる数',
    summary: '2つの数列に共通して現れる数が何種類あるかを求めます。',
    statement:
      '1行目に整数 N と M が半角スペース区切りで与えられます。' +
      '2行目に N 個の整数、3行目に M 個の整数が、それぞれ半角スペース区切りで与えられます。<br><br>' +
      '<strong>両方の数列に登場する数</strong>が何種類あるかを、1行で出力してください。' +
      '同じ数が何回出てきても、1種類として数えます。<br><br>' +
      '例えば <code>1 2 3</code> と <code>2 3 4</code> のとき、共通するのは 2 と 3 なので <code>2</code> と出力します。',
    constraints: '1 ≤ N, M ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '3 3\n1 2 3\n2 3 4', output: '2' },
      { input: '2 2\n1 2\n3 4', output: '0' }
    ],
    testCases: [
      { input: '3 3\n1 2 3\n2 3 4', output: '2' },
      { input: '2 2\n1 2\n3 4', output: '0' },
      { input: '3 2\n5 5 5\n5 9', output: '1' },
      { input: '4 4\n1 2 3 4\n1 2 3 4', output: '4' }
    ],
    starter: ''
  },
  {
    id: 40,
    language: 'python',
    type: 'io',
    tag: 'Python ・ 標準入出力',
    difficulty: '上級',
    title: '隣り合う2つの最大の和',
    summary: '隣り合った2つの要素の組み合わせの中で、合計が最も大きいものを求めます。',
    statement:
      '1行目に整数 N、2行目に N 個の整数が半角スペース区切りで与えられます。' +
      '<strong>隣り合う2つの要素</strong>を足したもののうち、最も大きい値を1行で出力してください。<br><br>' +
      '例えば <code>1 2 3 4 5</code> のとき、隣り合う和は 3, 5, 7, 9 なので、答えは <code>9</code> です。',
    constraints: '2 ≤ N ≤ 100、0 ≤ 各要素 ≤ 1000',
    samples: [
      { input: '5\n1 2 3 4 5', output: '9' },
      { input: '3\n10 1 10', output: '11' }
    ],
    testCases: [
      { input: '5\n1 2 3 4 5', output: '9' },
      { input: '3\n10 1 10', output: '11' },
      { input: '2\n7 8', output: '15' },
      { input: '6\n1 9 9 1 1 1', output: '18' }
    ],
    starter: ''
  },
];
