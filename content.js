(function () {
  const MODE_CLASS = "yt-player-focus-mode";
  const CONTROLS_ID = "yt-player-focus-controls";
  const BUTTON_ID = "yt-player-focus-toggle";
  const HOME_BUTTON_ID = "yt-player-focus-home";
  const HOME_URL = "https://www.youtube.com/";

  let currentUrl = "";
  let focusModeEnabled = true;

  function isWatchPage() {
    return window.location.pathname === "/watch";
  }

  function ensureControls() {
    let controls = document.getElementById(CONTROLS_ID);
    if (controls) {
      return controls;
    }

    controls = document.createElement("div");
    controls.id = CONTROLS_ID;

    const homeButton = document.createElement("button");
    homeButton.id = HOME_BUTTON_ID;
    homeButton.type = "button";
    homeButton.textContent = "Home";
    homeButton.setAttribute("aria-label", "Go to YouTube home page");
    homeButton.addEventListener("click", () => {
      window.location.href = HOME_URL;
    });

    const toggleButton = document.createElement("button");
    toggleButton.id = BUTTON_ID;
    toggleButton.type = "button";
    toggleButton.textContent = "Show Page";
    toggleButton.setAttribute("aria-pressed", "true");
    toggleButton.setAttribute("aria-label", "Toggle YouTube player focus mode");
    toggleButton.addEventListener("click", () => {
      focusModeEnabled = !focusModeEnabled;
      applyMode();
    });

    controls.appendChild(homeButton);
    controls.appendChild(toggleButton);
    document.documentElement.appendChild(controls);
    return controls;
  }

  function updateButtons() {
    const controls = ensureControls();
    const toggleButton = document.getElementById(BUTTON_ID);
    const onWatchPage = isWatchPage();

    if (!onWatchPage) {
      controls.style.display = "none";
      return;
    }

    controls.style.display = "inline-flex";
    if (toggleButton) {
      toggleButton.textContent = focusModeEnabled ? "Show Page" : "Hide Page";
      toggleButton.setAttribute("aria-pressed", String(focusModeEnabled));
    }
  }

  function applyMode() {
    const onWatchPage = isWatchPage();
    if (onWatchPage && focusModeEnabled) {
      document.body.classList.add(MODE_CLASS);
    } else {
      document.body.classList.remove(MODE_CLASS);
    }
    updateButtons();
  }

  function syncForUrlChange() {
    const url = window.location.href;
    if (url === currentUrl) {
      return;
    }

    currentUrl = url;
    focusModeEnabled = true;
    applyMode();
  }

  function startUrlWatcher() {
    currentUrl = window.location.href;
    applyMode();

    setInterval(syncForUrlChange, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startUrlWatcher, {
      once: true
    });
  } else {
    startUrlWatcher();
  }
})();
