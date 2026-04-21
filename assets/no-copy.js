(function () {
  if (window.__makexNoCopyEnabled) {
    return;
  }

  window.__makexNoCopyEnabled = true;

  const allowTargets = [
    "input",
    "textarea",
    "select",
    "option",
    '[contenteditable="true"]',
    "[data-allow-copy]",
    "[data-allow-copy] *",
  ];
  const allowSelector = allowTargets.join(", ");
  const blockedShortcutKeys = new Set(["a", "c", "x"]);
  const watermarkSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="280" viewBox="0 0 420 280">
      <g transform="rotate(-24 210 140)">
        <text
          x="38"
          y="154"
          fill="#8d3010"
          fill-opacity="0.04"
          font-size="40"
          font-family="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
          font-weight="700"
          letter-spacing="6"
        >
          MakeX
        </text>
      </g>
    </svg>
  `);
  const watermarkUrl = `url("data:image/svg+xml,${watermarkSvg}")`;

  function isAllowedTarget(target) {
    return Boolean(target && target.closest && target.closest(allowSelector));
  }

  function blockIfNeeded(event) {
    if (isAllowedTarget(event.target)) {
      return;
    }

    event.preventDefault();

    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    }
  }

  function addWatermark() {
    if (document.querySelector("[data-makex-watermark]")) {
      return;
    }

    const watermarkLayer = document.createElement("div");
    watermarkLayer.setAttribute("data-makex-watermark", "true");
    watermarkLayer.setAttribute("aria-hidden", "true");
    watermarkLayer.className = "makex-watermark-layer";
    document.body.appendChild(watermarkLayer);
  }

  function enableProtection() {
    document.documentElement.classList.add("no-copy-enabled");

    const style = document.createElement("style");
    style.setAttribute("data-no-copy-style", "true");
    const allowStyleSelector = allowTargets
      .map((selector) => `html.no-copy-enabled ${selector}`)
      .join(",\n      ");

    style.textContent = `
      html.no-copy-enabled,
      html.no-copy-enabled body {
        -webkit-touch-callout: none;
      }

      html.no-copy-enabled body *,
      html.no-copy-enabled body *::before,
      html.no-copy-enabled body *::after {
        -webkit-user-select: none;
        user-select: none;
      }

      ${allowStyleSelector} {
        -webkit-user-select: text !important;
        user-select: text !important;
      }

      html.no-copy-enabled .makex-watermark-layer {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        pointer-events: none;
        background-image: ${watermarkUrl};
        background-repeat: repeat;
        background-size: 420px 280px;
        opacity: 1;
      }

      @media print {
        html.no-copy-enabled .makex-watermark-layer {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
    addWatermark();

    ["copy", "cut", "contextmenu", "dragstart", "selectstart"].forEach((eventName) => {
      document.addEventListener(eventName, blockIfNeeded, true);
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (!(event.ctrlKey || event.metaKey)) {
          return;
        }

        if (!blockedShortcutKeys.has(String(event.key).toLowerCase())) {
          return;
        }

        blockIfNeeded(event);
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enableProtection, { once: true });
  } else {
    enableProtection();
  }
})();
