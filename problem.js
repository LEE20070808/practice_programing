// プロブレム画面: 与えられたHTML + ユーザーのJSをiframeで実行する

(function () {
  const GIVEN_HTML = `
<div class="demo-card">
  <h1 id="title">Hello, Learner!</h1>
  <button id="colorBtn">色を変える</button>
</div>
`;

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
  .demo-card {
    text-align: center;
  }
  .demo-card h1 {
    font-size: 22px;
    margin: 0 0 16px;
    color: #1a1f2b;
    transition: color .2s ease;
  }
  .demo-card button {
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #d8dce4;
    background: #f4f5f7;
    cursor: pointer;
  }
</style>
`;

  const textarea = document.getElementById('jsInput');
  const runBtn = document.getElementById('runBtn');
  const statusMsg = document.getElementById('statusMsg');
  const frame = document.getElementById('previewFrame');

  function runCode() {
    const userJs = textarea.value;
    const doc = `<!DOCTYPE html><html><head>${PREVIEW_STYLE}</head><body>${GIVEN_HTML}<script>${userJs}<\/script></body></html>`;

    statusMsg.classList.remove('show', 'error');
    frame.srcdoc = doc;

    frame.onload = () => {
      statusMsg.textContent = '実行しました';
      statusMsg.classList.add('show');
    };
  }

  runBtn.addEventListener('click', runCode);

  // 初期プレビュー（開始時点のコードで一度実行しておく）
  runCode();
})();