// プロブレム詳細: URLの ?id= から問題を1つ読み込んで表示・実行する

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
    return escaped
      .replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="tag">$2</span>')
      .replace(/([a-zA-Z-]+)=(&quot;|")([^"]*)(&quot;|")/g, '<span class="attr">$1</span>=<span class="str">"$3"</span>')
      .replace(/=&quot;([^&]*)&quot;/g, '="<span class="str">$1</span>"');
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

  function runCode() {
    const userJs = textarea.value;
    const doc = `<!DOCTYPE html><html><head>${PREVIEW_STYLE}</head><body>${problem.html}<script>${userJs}<\/script></body></html>`;

    statusMsg.classList.remove('show', 'error');
    frame.srcdoc = doc;

    frame.onload = () => {
      statusMsg.textContent = '実行しました';
      statusMsg.classList.add('show');
    };
  }

  runBtn.addEventListener('click', runCode);
  runCode();
})();