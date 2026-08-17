// ログイン状態の表示切り替え（Googleログインボタン ⇔ ユーザーアイコン）

(function () {
  let googleClientId = null;

  function renderLoggedOut(container) {
    container.innerHTML = '<div id="googleSignInDiv"></div>';
    tryRenderGoogleButton();
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

  function tryRenderGoogleButton() {
    if (!googleClientId) return;
    if (typeof google === 'undefined' || !google.accounts) {
      setTimeout(tryRenderGoogleButton, 200);
      return;
    }
    const target = document.getElementById('googleSignInDiv');
    if (!target) return;

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      use_fedcm_for_button: true
    });
    google.accounts.id.renderButton(target, {
      theme: 'filled_black',
      size: 'medium',
      shape: 'pill',
      text: 'signin'
    });
  }

  function handleCredentialResponse(response) {
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential })
    })
      .then((r) => r.json())
      .then(() => location.reload())
      .catch((err) => console.error('ログインに失敗しました', err));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const authArea = document.getElementById('authArea');
    if (!authArea) return;

    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => {
        googleClientId = cfg.googleClientId;

        return fetch('/api/me', { credentials: 'include' }).then((r) => r.json());
      })
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
