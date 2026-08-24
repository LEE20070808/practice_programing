// 設定ページ: アカウント情報の表示とログアウト

(function () {
  const area = document.getElementById('settingsArea');

  function renderLoggedOut() {
    area.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <p class="terminal-line">&gt; not_logged_in<span class="cursor">_</span></p>
          <p class="empty-sub">
            設定を見るにはログインが必要です。<br>
            右上の「Googleでログイン」からログインしてください。
          </p>
        </div>
      </div>
    `;
  }

  function renderAccount(user) {
    area.innerHTML = `
      <div class="panel account-panel">
        <img class="account-avatar" src="${user.picture}" alt="${user.name}">
        <div class="account-info">
          <h3>${user.name}</h3>
          <p class="account-email">${user.email}</p>
          <p class="account-streak">連続ログイン日数: <strong>${String(user.loginStreak).padStart(2, '0')}</strong> 日</p>
        </div>
        <button class="logout-btn-large" id="settingsLogoutBtn" type="button">ログアウト</button>
      </div>
    `;

    document.getElementById('settingsLogoutBtn').addEventListener('click', () => {
      fetch('/api/logout', { method: 'POST', credentials: 'include' })
        .then(() => location.reload());
    });
  }

  fetch('/api/me', { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => {
      if (data.user) {
        renderAccount(data.user);
      } else {
        renderLoggedOut();
      }
    })
    .catch(() => renderLoggedOut());
})();
