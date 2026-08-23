// ログイン状態の表示切り替え（Googleログインリンク ⇔ ユーザーアイコン）

(function () {
  function renderLoggedOut(container) {
    container.innerHTML = '<a href="/auth/google" class="google-login-btn">Googleでログイン</a>';
  }

  function renderLoggedIn(container, user) {
    container.innerHTML = `
      <div class="user-menu">
        <img class="avatar-img" src="${user.picture}" alt="${user.name}">
        <button class="logout-btn" id="logoutBtn" type="button">ログアウト</button>
      </div>
    `;
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
        } else {
          renderLoggedOut(authArea);
          if (streakEl) streakEl.textContent = '--';
        }
      })
      .catch((err) => console.error('ログイン状態の取得に失敗しました', err));
  });
})();
