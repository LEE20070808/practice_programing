// プロブレム詳細: URLの ?id= から問題を1つ読み込んで表示・実行する
// problem.type が 'io'（標準入出力/AtCoder方式）なら Pyodide で実行して判定、
// それ以外（従来のJS/DOM問題）は与えられたHTMLをiframeで実行して判定する。

(function () {
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ざっくりしたシンタックスハイライト（タグ名・属性名・文字列に色付け）
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
  const isIoProblem = problem.type === 'io';

  document.title = `${problem.title} | CodeDrill`;

  const infoPanel = document.getElementById('problemInfo');
  const textarea = document.getElementById('jsInput');
  const editorLabel = document.getElementById('editorLabel');
  const runBtn = document.getElementById('runBtn');
  const statusMsg = document.getElementById('statusMsg');
  const testResult = document.getElementById('testResult');
  const previewPanel = document.getElementById('previewPanel');
  const ioPanel = document.getElementById('ioPanel');
  const ioCasesEl = document.getElementById('ioCases');

  textarea.value = problem.starter || '';

  let alreadyMarkedSolved = false;
  function markSolvedOnce() {
    if (alreadyMarkedSolved) return;
    alreadyMarkedSolved = true;
    fetch(`/api/problems/${problem.id}/solve`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
  }

  if (isIoProblem) {
    // ---------- 入出力（AtCoder方式）問題 ----------
    editorLabel.textContent = `あなたの${problem.language === 'python' ? 'Python' : 'コード'}`;
    previewPanel.style.display = 'none';
    ioPanel.style.display = '';

    const samplesHtml = (problem.samples || []).map((s, i) => `
      <div class="io-sample">
        <p class="subheading">入力例 ${i + 1}</p>
        <pre class="code-block"><code>${escapeHtml(s.input)}</code></pre>
        <p class="subheading">出力例 ${i + 1}</p>
        <pre class="code-block"><code>${escapeHtml(s.output)}</code></pre>
      </div>
    `).join('');

    infoPanel.innerHTML = `
      <span class="problem-tag">${problem.tag}</span>
      <h3 class="problem-title">問題${problem.id}: ${problem.title}</h3>
      <p class="problem-desc">${problem.statement}</p>
      ${problem.constraints ? `<p class="subheading">制約</p><p class="problem-desc">${problem.constraints}</p>` : ''}
      ${samplesHtml}
    `;

    let pyodidePromise = null;
    function ensurePyodide() {
      if (!pyodidePromise) {
        pyodidePromise = window.loadPyodide();
      }
      return pyodidePromise;
    }

    async function runPythonCase(pyodide, code, input) {
      pyodide.globals.set('__user_code', code);
      pyodide.globals.set('__input_data', input);
      const wrapper = `
import sys, io
sys.stdin = io.StringIO(__input_data)
_stdout = io.StringIO()
sys.stdout = _stdout
__error = None
try:
    exec(__user_code, {})
except Exception as e:
    __error = str(e)
sys.stdout = sys.__stdout__
_result = _stdout.getvalue()
`;
      await pyodide.runPythonAsync(wrapper);
      const output = pyodide.globals.get('_result');
      const error = pyodide.globals.get('__error');
      return { output: output || '', error: error || null };
    }

    function normalize(str) {
      return String(str).trim().split('\n').map((line) => line.trimEnd()).join('\n');
    }

    async function runAllCases() {
      const code = textarea.value;
      const testCases = problem.testCases || [];

      ioCasesEl.innerHTML = '<p class="io-loading">Pythonを準備しています…（初回は少し時間がかかります）</p>';
      testResult.classList.remove('show', 'test-pass', 'test-fail');
      runBtn.disabled = true;
      runBtn.textContent = '実行中…';

      try {
        const pyodide = await ensurePyodide();
        let allPassed = true;
        const rows = [];

        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const { output, error } = await runPythonCase(pyodide, code, tc.input);

          let passed = false;
          if (error) {
            passed = false;
          } else {
            passed = normalize(output) === normalize(tc.output);
          }
          if (!passed) allPassed = false;

          rows.push(`
            <div class="io-case ${passed ? 'io-case-pass' : 'io-case-fail'}">
              <div class="io-case-header">
                <span>ケース ${i + 1}</span>
                <span>${passed ? '✓ AC' : (error ? '✗ RE (実行エラー)' : '✗ WA')}</span>
              </div>
              <div class="io-case-body">
                <div><span class="io-case-label">入力</span><pre>${escapeHtml(tc.input)}</pre></div>
                <div><span class="io-case-label">期待する出力</span><pre>${escapeHtml(tc.output)}</pre></div>
                <div><span class="io-case-label">実際の出力</span><pre>${escapeHtml(error ? ('Error: ' + error) : output)}</pre></div>
              </div>
            </div>
          `);
        }

        ioCasesEl.innerHTML = rows.join('');

        testResult.classList.add('show');
        if (allPassed) {
          testResult.classList.add('test-pass');
          testResult.classList.remove('test-fail');
          testResult.textContent = `✓ 正解！ 全${testCases.length}ケースに正解しました。`;
          markSolvedOnce();
        } else {
          testResult.classList.add('test-fail');
          testResult.classList.remove('test-pass');
          testResult.textContent = '✗ まだ正解ではありません。上のケースを確認してください。';
        }
      } catch (err) {
        ioCasesEl.innerHTML = '';
        testResult.classList.add('show', 'test-fail');
        testResult.textContent = 'Pythonの実行環境の読み込みに失敗しました。時間をおいて再度お試しください。';
        console.error(err);
      } finally {
        statusMsg.textContent = '実行しました';
        statusMsg.classList.add('show');
        runBtn.disabled = false;
        runBtn.textContent = '実行する ▶';
      }
    }

    runBtn.addEventListener('click', runAllCases);
  } else {
    // ---------- 従来のJS/DOM問題 ----------
    infoPanel.innerHTML = `
      <span class="problem-tag">${problem.tag}</span>
      <h3 class="problem-title">問題${problem.id}: ${problem.title}</h3>
      <p class="problem-desc">${problem.description}</p>
      <p class="subheading">与えられたHTML</p>
      <pre class="code-block"><code>${highlightHtml(problem.html)}</code></pre>
    `;

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

    let hasRunManually = false;

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

    window.addEventListener('message', (event) => {
      if (!event.data || event.data.type !== 'codedrill-test-result') return;
      if (!testResult || !hasRunManually) return;

      testResult.classList.add('show');
      if (event.data.passed) {
        testResult.classList.add('test-pass');
        testResult.classList.remove('test-fail');
        testResult.textContent = '✓ 正解！ ' + event.data.message;
        markSolvedOnce();
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
  }

  // --- AIレビュー（JS/Python共通） ---
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
