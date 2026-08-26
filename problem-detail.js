// プロブレム詳細: URLの ?id= から問題を1つ読み込んで表示・実行する

(function () {
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ざっくりしたシンタックスハイライト（タグ名・属性名・文字列に色付け）
  // タグ単位でまとめて処理することで、挿入したspanタグ自体に誤って
  // 色付け処理がかからないようにしている
  function highlightHtml(rawHtml) {
    const escaped = escapeHtml(rawHtml);
    const tagPattern = /(&lt;\/?)([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+="[^"]*")*)(\s*\/?&gt;)/g;
    const attrPattern = /([a-zA-Z-]+)="([^"]*)"/g;

    return escaped.replace(tagPattern, (match, open, tagName, attrs, close) => {
      const highlightedAttrs = attrs.replace(
        attrPattern,
        '<span class="attr">$1</span>=<span class="str">"$2"</span>'
      );
      return `${open}<span class="tag">${tagName}</span>${highlightedAttrs}${close}`;
    });
  }

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id')) || PROBLEMS[0].id;
  const problem = PROBLEMS.find((p) => p.id === id) || PROBLEMS[0];

  const infoPanel = document.getElementById('problemInfo');
  infoPanel.innerHTML = `
    <span class="problem-tag">${problem.tag}</span>
    <h3 class="problem-title">問題${problem.id}: ${problem.title}</h3>
    <p class="problem-desc">${problem.description}</p>
    <p class="subheading">与えられたHTML</p>
    <pre class="code-block"><code>${highlightHtml(problem.html)}</code></pre>
  `;

  document.title = `${problem.title} | CodeDrill`;

  const textarea = document.getElementById('jsInput');
  textarea.value = problem.starter;

  const runBtn = document.getElementById('runBtn');
  const statusMsg = document.getElementById('statusMsg');
  const frame = document.getElementById('previewFrame');

  const PREVIEW_STYLE = `
<style>
  body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: system-ui, sans-serif;
    background: #ffffff;
  }
  .demo-card { text-align: center; min-width: 240px; }
  .demo-card h1 {
    font-size: 22px;
    margin: 0 0 16px;
    color: #1a1f2b;
    transition: color .2s ease;
  }
  .demo-card p {
    font-size: 15px;
    color: #33394a;
    margin: 10px 0;
  }
  .demo-card label {
    font-size: 14px;
    color: #33394a;
  }
  .demo-card input[type="text"] {
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #d8dce4;
    margin-bottom: 4px;
  }
  .demo-card button {
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #d8dce4;
    background: #f4f5f7;
    cursor: pointer;
    margin-left: 6px;
  }
  .demo-card ul {
    list-style: none;
    padding: 0;
    margin: 14px 0 0;
    text-align: left;
    display: inline-block;
    min-width: 160px;
  }
  .demo-card li {
    padding: 6px 10px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #1a1f2b;
  }
</style>
`;

  const testResult = document.getElementById('testResult');
  let hasRunManually = false;

  // 与えられたHTML + ユーザーのJS を実行したあと、問題ごとのテストを
  // iframeの中で走らせて、結果をpostMessageで親ページに送ってもらう
  function runCode() {
    const userJs = textarea.value;
    const testScript = problem.test || '';

    const doc = `<!DOCTYPE html><html><head>${PREVIEW_STYLE}</head><body>${problem.html}
<script>
${userJs}
<\/script>
<script>
${testScript}
try {
  if (typeof runTest === 'function') {
    const result = runTest();
    parent.postMessage({ type: 'codedrill-test-result', passed: !!result.passed, message: result.message || '' }, '*');
  }
} catch (err) {
  parent.postMessage({ type: 'codedrill-test-result', passed: false, message: 'コードの実行中にエラーが発生しました: ' + err.message }, '*');
}
<\/script>
</body></html>`;

    statusMsg.classList.remove('show', 'error');
    if (testResult) {
      testResult.classList.remove('show', 'test-pass', 'test-fail');
    }
    frame.srcdoc = doc;

    frame.onload = () => {
      statusMsg.textContent = '実行しました';
      statusMsg.classList.add('show');
    };
  }

  // iframeからの採点結果を受け取って表示する。ページ読み込み直後の
  // 自動実行では表示せず、「実行する」を押した後だけ結果を出す。
  let alreadyMarkedSolved = false;
  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'codedrill-test-result') return;
    if (!testResult || !hasRunManually) return;

    testResult.classList.add('show');
    if (event.data.passed) {
      testResult.classList.add('test-pass');
      testResult.classList.remove('test-fail');
      testResult.textContent = '✓ 正解！ ' + event.data.message;

      if (!alreadyMarkedSolved) {
        alreadyMarkedSolved = true;
        fetch(`/api/problems/${problem.id}/solve`, {
          method: 'POST',
          credentials: 'include'
        }).catch(() => {});
      }
    } else {
      testResult.classList.add('test-fail');
      testResult.classList.remove('test-pass');
      testResult.textContent = '✗ まだ正解ではありません。' + (event.data.message ? ' ' + event.data.message : '');
    }
  });

  runBtn.addEventListener('click', () => {
    hasRunManually = true;
    runCode();
  });

  runCode();

  // --- AIレビュー ---
  const aiReviewBtn = document.getElementById('aiReviewBtn');
  const aiReviewResult = document.getElementById('aiReviewResult');

  if (aiReviewBtn) {
    aiReviewBtn.addEventListener('click', () => {
      aiReviewBtn.disabled = true;
      aiReviewBtn.textContent = 'AIが確認中…';
      aiReviewResult.classList.remove('show', 'error');
      aiReviewResult.innerHTML = '';

      fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ problemId: problem.id, code: textarea.value })
      })
        .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) {
            aiReviewResult.classList.add('show', 'error');
            aiReviewResult.textContent = data.error || 'AIレビューに失敗しました。';
            return;
          }

          const improvedCodeHtml = data.improvedCode
            ? `<p class="subheading">改善されたコード例</p><pre class="code-block"><code>${escapeHtml(data.improvedCode)}</code></pre>`
            : '';
          const promptHintHtml = data.promptHint
            ? `<p class="subheading">プロンプトのヒント</p><p class="ai-review-text">${escapeHtml(data.promptHint)}</p>`
            : '';
          const explanationHtml = data.explanation
            ? `<p class="subheading">何が改善されたか</p><p class="ai-review-text">${escapeHtml(data.explanation)}</p>`
            : '';

          aiReviewResult.classList.add('show');
          aiReviewResult.innerHTML = explanationHtml + improvedCodeHtml + promptHintHtml;
        })
        .catch(() => {
          aiReviewResult.classList.add('show', 'error');
          aiReviewResult.textContent = '通信エラーが発生しました。時間をおいて試してください。';
        })
        .finally(() => {
          aiReviewBtn.disabled = false;
          aiReviewBtn.textContent = '🤖 AIにレビューしてもらう';
        });
    });
  }
})();
