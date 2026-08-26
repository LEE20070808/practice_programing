// プロブレム一覧: PROBLEMS配列からカードを生成する
// 言語・難易度フィルター、解いた問題のバッジ表示に対応

(function () {
  const grid = document.getElementById('problemGrid');
  const langFilterEl = document.getElementById('langFilter');
  const diffFilterEl = document.getElementById('diffFilter');

  const LANGUAGE_LABELS = {
    javascript: 'JavaScript',
    python: 'Python',
    go: 'Go'
  };

  let currentLang = 'all';
  let currentDiff = 'all';
  let solvedSet = new Set();

  // 実際に問題データに存在する言語だけをボタンとして生成する
  function buildLanguageButtons() {
    const languages = Array.from(new Set(PROBLEMS.map((p) => p.language || 'javascript')));
    const buttonsHtml = languages.map((lang) => {
      const label = LANGUAGE_LABELS[lang] || lang;
      return `<button class="filter-btn" data-value="${lang}">${label}</button>`;
    }).join('');
    langFilterEl.insertAdjacentHTML('beforeend', buttonsHtml);
  }

  function setActiveButton(container, value) {
    container.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.value === value);
    });
  }

  function renderCards() {
    const filtered = PROBLEMS.filter((p) => {
      const lang = p.language || 'javascript';
      const langOk = currentLang === 'all' || lang === currentLang;
      const diffOk = currentDiff === 'all' || p.difficulty === currentDiff;
      return langOk && diffOk;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p class="terminal-line">&gt; no_problems_matched<span class="cursor">_</span></p>
          <p class="empty-sub">この条件に合う問題はまだありません。</p>
        </div>
      `;
      return;
    }

    const cardsHtml = filtered.map((p) => {
      const solved = solvedSet.has(p.id);
      const langLabel = LANGUAGE_LABELS[p.language || 'javascript'] || p.language;
      return `
        <a class="problem-card${solved ? ' is-solved' : ''}" href="problem-detail.html?id=${p.id}">
          <div class="card-badges">
            <span class="badge badge-lang">${langLabel}</span>
            <span class="badge badge-tag">${p.tag}</span>
            <span class="badge badge-diff-${p.difficulty}">${p.difficulty}</span>
            ${solved ? '<span class="badge badge-solved">✓ 解決済み</span>' : ''}
          </div>
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
          <span class="card-link">この問題を解く →</span>
        </a>
      `;
    }).join('');

    grid.innerHTML = cardsHtml;
  }

  buildLanguageButtons();

  langFilterEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    currentLang = btn.dataset.value;
    setActiveButton(langFilterEl, currentLang);
    renderCards();
  });

  diffFilterEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    currentDiff = btn.dataset.value;
    setActiveButton(diffFilterEl, currentDiff);
    renderCards();
  });

  // まず未ログイン状態と同じ見た目（バッジなし）で先に表示し、
  // ログイン状態が分かり次第バッジを反映する
  renderCards();

  fetch('/api/solved-ids', { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => {
      solvedSet = new Set(data.solvedIds || []);
      renderCards();
    })
    .catch(() => {});
})();
