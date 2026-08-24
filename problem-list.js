// プロブレム一覧: PROBLEMS配列からカードを生成する（解いた問題にはバッジをつける）

(function () {
  const grid = document.getElementById('problemGrid');

  function renderCards(solvedIds) {
    const solvedSet = new Set(solvedIds);

    const cardsHtml = PROBLEMS.map((p) => {
      const solved = solvedSet.has(p.id);
      return `
        <a class="problem-card${solved ? ' is-solved' : ''}" href="problem-detail.html?id=${p.id}">
          <div class="card-badges">
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

  // まず未ログイン状態と同じ見た目（バッジなし）で先に表示し、
  // ログイン状態が分かり次第バッジを反映する
  renderCards([]);

  fetch('/api/solved-ids', { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => renderCards(data.solvedIds || []))
    .catch(() => {});
})();
