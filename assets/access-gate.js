(function () {
  if (window.__makexAccessGateEnabled) {
    return;
  }

  window.__makexAccessGateEnabled = true;

  const ACCESS_HASH = "7ad4658d59ed5203545296b0f9b5f5c8642082b4837bf8e23ce375cd79af00b7";
  const STORAGE_KEY = "makexAccessGrant";
  const ACCESS_TTL_MS = 12 * 60 * 60 * 1000;
  const LOCK_CLASS = "makex-access-locked";

  const html = document.documentElement;
  const style = document.createElement("style");
  style.setAttribute("data-makex-access-style", "true");
  style.textContent = `
    html.${LOCK_CLASS} body {
      overflow: hidden !important;
    }

    html.${LOCK_CLASS} body > *:not(.makex-access-screen) {
      visibility: hidden !important;
    }

    .makex-access-screen {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at top left, rgba(204, 90, 47, 0.24), transparent 32%),
        radial-gradient(circle at right center, rgba(141, 48, 16, 0.14), transparent 30%),
        linear-gradient(180deg, rgba(247, 241, 231, 0.98), rgba(242, 236, 227, 0.98));
    }

    .makex-access-panel {
      width: min(460px, 100%);
      padding: 30px 28px;
      border: 1px solid rgba(141, 48, 16, 0.14);
      border-radius: 28px;
      background: rgba(255, 250, 242, 0.97);
      box-shadow: 0 28px 80px rgba(64, 43, 26, 0.18);
      color: #1f2430;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    }

    .makex-access-eyebrow {
      display: inline-flex;
      align-items: center;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(204, 90, 47, 0.12);
      color: #8d3010;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .makex-access-title {
      margin: 18px 0 10px;
      font-size: 34px;
      line-height: 1.12;
      letter-spacing: -0.03em;
    }

    .makex-access-copy {
      margin: 0 0 20px;
      color: #5d6472;
      font-size: 15px;
      line-height: 1.75;
    }

    .makex-access-field {
      display: grid;
      gap: 12px;
    }

    .makex-access-label {
      font-size: 14px;
      font-weight: 700;
      color: #8d3010;
    }

    .makex-access-input {
      width: 100%;
      padding: 15px 16px;
      border: 1px solid rgba(31, 36, 48, 0.12);
      border-radius: 16px;
      background: #fffdfa;
      color: #1f2430;
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .makex-access-input:focus {
      border-color: rgba(204, 90, 47, 0.55);
      box-shadow: 0 0 0 4px rgba(204, 90, 47, 0.12);
    }

    .makex-access-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 18px;
    }

    .makex-access-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 126px;
      padding: 13px 18px;
      border: 0;
      border-radius: 16px;
      background: linear-gradient(135deg, #cc5a2f, #8d3010);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 14px 34px rgba(141, 48, 16, 0.2);
    }

    .makex-access-button[disabled] {
      opacity: 0.72;
      cursor: wait;
    }

    .makex-access-hint {
      margin: 16px 0 0;
      min-height: 22px;
      color: #b64922;
      font-size: 14px;
      line-height: 1.5;
    }

    .makex-access-footnote {
      margin: 18px 0 0;
      color: #7a818e;
      font-size: 12px;
      line-height: 1.6;
    }
  `;
  document.head.appendChild(style);

  function getStoredGrant() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        parsed.hash !== ACCESS_HASH ||
        typeof parsed.expiresAt !== "number" ||
        parsed.expiresAt < Date.now()
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  function saveGrant() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          hash: ACCESS_HASH,
          expiresAt: Date.now() + ACCESS_TTL_MS,
        })
      );
    } catch (error) {
      window.__makexAccessGateGranted = true;
    }
  }

  async function sha256(value) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("unsupported");
    }

    const buffer = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );

    return Array.from(new Uint8Array(buffer))
      .map((item) => item.toString(16).padStart(2, "0"))
      .join("");
  }

  function unlock() {
    html.classList.remove(LOCK_CLASS);
    const overlay = document.querySelector(".makex-access-screen");
    if (overlay) {
      overlay.remove();
    }
  }

  function lock() {
    html.classList.add(LOCK_CLASS);
  }

  function buildOverlay() {
    if (!document.body || document.querySelector(".makex-access-screen")) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "makex-access-screen";
    overlay.setAttribute("aria-hidden", "false");
    overlay.innerHTML = `
      <div class="makex-access-panel" data-allow-copy="true">
        <div class="makex-access-eyebrow">PRIVATE ACCESS</div>
        <h1 class="makex-access-title">输入 Token 才能进入<br>Access Token Required</h1>
        <p class="makex-access-copy">
          这是受控分享页面。输入正确的 token 后，当前设备会保持 12 小时可访问。<br>
          This is a controlled sharing site. Enter the correct token to unlock access for 12 hours on this device.
        </p>
        <div class="makex-access-field">
          <label class="makex-access-label" for="makexAccessInput">Access Token</label>
          <input
            id="makexAccessInput"
            class="makex-access-input"
            type="password"
            inputmode="text"
            autocomplete="off"
            spellcheck="false"
            placeholder="请输入 token / Enter token"
            data-allow-copy="true"
          >
        </div>
        <div class="makex-access-actions">
          <button type="button" class="makex-access-button" id="makexAccessSubmit">进入 / Unlock</button>
        </div>
        <p class="makex-access-hint" id="makexAccessHint"></p>
        <p class="makex-access-footnote">如果你需要更新 token，只要替换共享脚本里的哈希值即可。GitHub Pages 静态站点上的这层验证主要用于提高访问门槛，不等同于服务端权限控制。</p>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById("makexAccessInput");
    const submit = document.getElementById("makexAccessSubmit");
    const hint = document.getElementById("makexAccessHint");

    function setHint(message) {
      hint.textContent = message || "";
    }

    async function verify() {
      const token = input.value.trim();
      if (!token) {
        setHint("请输入正确的 token。");
        input.focus();
        return;
      }

      submit.disabled = true;
      setHint("验证中...");

      try {
        const hash = await sha256(token);
        if (hash !== ACCESS_HASH) {
          setHint("Token 不正确，请重试。");
          submit.disabled = false;
          input.select();
          return;
        }

        saveGrant();
        setHint("");
        unlock();
      } catch (error) {
        setHint("当前浏览器环境不支持验证，请使用标准 HTTPS 浏览器打开。");
        submit.disabled = false;
      }
    }

    submit.addEventListener("click", verify);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        verify();
      }
    });

    input.focus();
  }

  if (window.__makexAccessGateGranted || getStoredGrant()) {
    unlock();
    return;
  }

  lock();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildOverlay, { once: true });
  } else {
    buildOverlay();
  }
})();
