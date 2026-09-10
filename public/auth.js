// ログイン状態の表示切り替え（Googleログインリンク ⇔ ユーザーアイコン）

(function () {
  function renderLoggedOut(container) {
    container.innerHTML = '<a href="/auth/google" class="google-login-btn">Googleでログイン</a>';
  }

  function renderLoggedIn(container, user) {
    // 表示名や画像URLは外部（Googleアカウント）由来なので、
    // innerHTML に埋め込まず DOM API で組み立てる。
    container.innerHTML = '';

    const menu = document.createElement('div');
    menu.className = 'user-menu';

    const img = document.createElement('img');
    img.className = 'avatar-img';
    // http(s) の画像URL以外は読み込まない
    if (/^https?:\/\//.test(user.picture || '')) {
      img.src = user.picture;
    }
    img.alt = user.name || 'ユーザー';

    const btn = document.createElement('button');
    btn.className = 'logout-btn';
    btn.id = 'logoutBtn';
    btn.type = 'button';
    btn.textContent = 'ログアウト';

    menu.appendChild(img);
    menu.appendChild(btn);
    container.appendChild(menu);

    document.getElementById('logoutBtn').addEventListener('click', () => {
      fetch('/api/logout', { method: 'POST', credentials: 'include' })
        .then(() => location.reload());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const authArea = document.getElementById('authArea');
    if (!authArea) return;

    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const user = data.user;
        const streakEl = document.getElementById('streakValue');

        if (user) {
          renderLoggedIn(authArea, user);
          if (streakEl) streakEl.textContent = String(user.loginStreak).padStart(2, '0');

          if (!user.hasSeenOnboarding && window.CodeDrillOnboarding) {
            window.CodeDrillOnboarding.showOnboarding();
          }
        } else {
          renderLoggedOut(authArea);
          if (streakEl) streakEl.textContent = '--';
        }
      })
      .catch((err) => console.error('ログイン状態の取得に失敗しました', err));
  });
})();
