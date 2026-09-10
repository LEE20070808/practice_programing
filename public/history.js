// 履歴ページ: 解いた問題を新しい順に表示する

(function () {
  const area = document.getElementById('historyArea');

  function formatDate(sqliteDatetime) {
    // SQLiteの datetime('now') は "YYYY-MM-DD HH:MM:SS"（UTC）形式
    const iso = sqliteDatetime.replace(' ', 'T') + 'Z';
    const d = new Date(iso);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const w = weekdays[d.getDay()];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day}(${w}) ${hh}:${mm}`;
  }

  function renderLoggedOut() {
    area.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <p class="terminal-line">&gt; login_required<span class="cursor">_</span></p>
          <p class="empty-sub">
            履歴を見るにはログインが必要です。<br>
            右上の「Googleでログイン」からログインしてください。
          </p>
        </div>
      </div>
    `;
  }

  function renderEmpty() {
    area.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <p class="terminal-line">&gt; no_history_yet<span class="cursor">_</span></p>
          <p class="empty-sub">
            まだ解いた問題がありません。<br>
            <a href="problem-list.html" style="color: var(--accent);">問題一覧</a>から挑戦してみましょう。
          </p>
        </div>
      </div>
    `;
  }

  const AXIS_LABEL = {
    readable: '読みやすさ',
    robust: '壊れにくさ',
    specific: '指示の具体性'
  };

  function renderHistory(history, promptHistory) {
    const solvedHtml = history.map((entry) => {
      const problem = PROBLEMS.find((p) => p.id === entry.problem_id);
      if (!problem) return '';
      return `
        <a class="history-item" href="problem-detail.html?id=${problem.id}">
          <div class="history-item-main">
            <span class="badge badge-tag">${problem.tag}</span>
            <h3>${problem.title}</h3>
          </div>
          <span class="history-item-date">${formatDate(entry.solved_at)}</span>
        </a>
      `;
    }).join('');

    const promptHtml = (promptHistory || []).map((entry) => {
      const problem = PROBLEMS.find((p) => p.id === entry.problem_id);
      const title = problem ? problem.title : `問題 ${entry.problem_id}`;
      const axis = AXIS_LABEL[entry.axis] || entry.axis || '';
      return `
        <a class="history-item" href="problem-detail.html?id=${entry.problem_id}">
          <div class="history-item-main">
            <span class="badge badge-tag">${axis}</span>
            <h3>${title}</h3>
          </div>
          <span class="history-item-date">${formatDate(entry.created_at)}</span>
        </a>
      `;
    }).join('');

    const solvedBlock = solvedHtml
      ? `<h2 class="subheading">正解した問題</h2><div class="history-list">${solvedHtml}</div>`
      : `<h2 class="subheading">正解した問題</h2><p class="empty-sub">まだありません。</p>`;
    const promptBlock = promptHtml
      ? `<h2 class="subheading" style="margin-top:28px;">プロンプト練習</h2><div class="history-list">${promptHtml}</div>`
      : `<h2 class="subheading" style="margin-top:28px;">プロンプト練習</h2><p class="empty-sub">まだレビューしていません。</p>`;

    if (!solvedHtml && !promptHtml) {
      renderEmpty();
      return;
    }
    area.innerHTML = solvedBlock + promptBlock;
  }

  fetch('/api/me', { credentials: 'include' })
    .then((r) => r.json())
    .then((meData) => {
      if (!meData.user) {
        renderLoggedOut();
        return;
      }
      return Promise.all([
        fetch('/api/history', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/prompt-history', { credentials: 'include' }).then((r) => r.json())
      ]).then(([solvedData, promptData]) => {
        renderHistory(solvedData.history || [], promptData.history || []);
      });
    })
    .catch(() => renderEmpty());
})();
