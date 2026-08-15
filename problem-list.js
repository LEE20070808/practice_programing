// プロブレム一覧: PROBLEMS配列からカードを生成する

(function () {
  const grid = document.getElementById('problemGrid');

  const cardsHtml = PROBLEMS.map((p) => `
    <a class="problem-card" href="problem-detail.html?id=${p.id}">
      <div class="card-badges">
        <span class="badge badge-tag">${p.tag}</span>
        <span class="badge badge-diff-${p.difficulty}">${p.difficulty}</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.summary}</p>
      <span class="card-link">この問題を解く →</span>
    </a>
  `).join('');

  grid.innerHTML = cardsHtml;
})();