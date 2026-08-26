// 初回ログイン時のスライド説明（Progate風のオンボーディング）

(function () {
  const SLIDES = [
    {
      title: 'CodeDrillへようこそ',
      body: 'CodeDrillは、AIを使ってコードを書きながら「良いプロンプトの書き方」を鍛えるサイトです。AIでコードを書くこと自体は簡単でも、うまく指示できている人は意外と多くありません。'
    },
    {
      title: '① 問題一覧から選ぶ',
      body: 'サイドバーの「problem」から、挑戦したい問題を選びます。難易度バッジ（初級・中級・上級）を目安にしてください。'
    },
    {
      title: '② 自分でコードを書く',
      body: '与えられたHTMLを見ながら、まずは自分の力で（あるいは普段の使い方で）JavaScriptを書いてみます。「実行する」でその場でプレビューを確認できます。'
    },
    {
      title: '③ AIにレビューしてもらう',
      body: '書いたコードをAIに送ると、より良いコードの例と一緒に「そのコードを引き出すにはどんなプロンプトを書けばよかったか」のヒントがもらえます。ここがこのサイトの一番の特徴です。'
    },
    {
      title: '④ その場で自動採点',
      body: '実行すると、期待した動きになっているか自動でチェックされます。正解すると記録され、問題一覧にバッジが付きます。'
    }
  ];

  let currentIndex = 0;
  let overlayEl = null;

  function completeOnboarding() {
    fetch('/api/onboarding/complete', { method: 'POST', credentials: 'include' }).catch(() => {});
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
  }

  function renderSlide() {
    const slide = SLIDES[currentIndex];
    const isLast = currentIndex === SLIDES.length - 1;

    overlayEl.querySelector('.onboarding-title').textContent = slide.title;
    overlayEl.querySelector('.onboarding-body').textContent = slide.body;
    overlayEl.querySelector('.onboarding-next').textContent = isLast ? 'はじめる' : '次へ →';

    const prevBtn = overlayEl.querySelector('.onboarding-prev');
    prevBtn.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';

    const dotsEl = overlayEl.querySelector('.onboarding-dots');
    dotsEl.innerHTML = SLIDES.map((_, i) =>
      `<span class="onboarding-dot${i === currentIndex ? ' active' : ''}"></span>`
    ).join('');
  }

  function showOnboarding() {
    overlayEl = document.createElement('div');
    overlayEl.className = 'onboarding-overlay';
    overlayEl.innerHTML = `
      <div class="onboarding-card">
        <button class="onboarding-skip" type="button">スキップ</button>
        <h2 class="onboarding-title"></h2>
        <p class="onboarding-body"></p>
        <div class="onboarding-dots"></div>
        <div class="onboarding-actions">
          <button class="onboarding-prev" type="button">← 戻る</button>
          <button class="onboarding-next" type="button"></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);

    overlayEl.querySelector('.onboarding-skip').addEventListener('click', completeOnboarding);
    overlayEl.querySelector('.onboarding-prev').addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        renderSlide();
      }
    });
    overlayEl.querySelector('.onboarding-next').addEventListener('click', () => {
      if (currentIndex < SLIDES.length - 1) {
        currentIndex += 1;
        renderSlide();
      } else {
        completeOnboarding();
      }
    });

    renderSlide();
  }

  // auth.js から、ログイン済み & 初回未閲覧のときに呼ばれる
  window.CodeDrillOnboarding = { showOnboarding };
})();
