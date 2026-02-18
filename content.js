(function () {
  const MODE_CLASS = "yt-player-focus-mode";
  const DETAILS_MODE_CLASS = "yt-player-details-mode";
  const HIDE_SHORTS_CLASS = "yt-hide-shorts-home";
  const UI_VISIBLE_CLASS = "yt-player-focus-ui-visible";
  const HIDE_UI_DELAY_MS = 1800;

  const METADATA_ID = "yt-player-focus-metadata";
  const TITLE_ID = "yt-player-focus-title";
  const CHANNEL_ID = "yt-player-focus-channel";
  const CONTROLS_ID = "yt-player-focus-controls";
  const BUTTON_ID = "yt-player-focus-toggle";
  const DETAILS_BUTTON_ID = "yt-player-focus-details";
  const HOME_BUTTON_ID = "yt-player-focus-home";
  const HOME_URL = "https://www.youtube.com/";
  const WATCH_MODE_FOCUS = "focus";
  const WATCH_MODE_DETAILS = "details";
  const WATCH_MODE_FULL = "full";

  let currentUrl = "";
  let watchMode = WATCH_MODE_FOCUS;
  let hideUiTimeoutId = null;

  function isWatchPage() {
    return window.location.pathname === "/watch";
  }

  function isHomePage() {
    return window.location.pathname === "/";
  }

  function ensureMetadata() {
    let metadata = document.getElementById(METADATA_ID);
    if (metadata) {
      return metadata;
    }

    metadata = document.createElement("div");
    metadata.id = METADATA_ID;

    const title = document.createElement("div");
    title.id = TITLE_ID;

    const channel = document.createElement("div");
    channel.id = CHANNEL_ID;

    metadata.appendChild(title);
    metadata.appendChild(channel);
    document.documentElement.appendChild(metadata);
    return metadata;
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
    toggleButton.setAttribute("aria-label", "Toggle full YouTube page visibility");
    toggleButton.addEventListener("click", () => {
      watchMode = watchMode === WATCH_MODE_FULL ? WATCH_MODE_FOCUS : WATCH_MODE_FULL;
      applyMode();
    });

    const detailsButton = document.createElement("button");
    detailsButton.id = DETAILS_BUTTON_ID;
    detailsButton.type = "button";
    detailsButton.textContent = "Show Details";
    detailsButton.setAttribute("aria-pressed", "false");
    detailsButton.setAttribute("aria-label", "Toggle YouTube details mode");
    detailsButton.addEventListener("click", () => {
      watchMode =
        watchMode === WATCH_MODE_DETAILS ? WATCH_MODE_FOCUS : WATCH_MODE_DETAILS;
      applyMode();
    });

    const separator = document.createElement("div");
    separator.className = "yt-focus-controls-sep";

    controls.appendChild(homeButton);
    controls.appendChild(separator);
    controls.appendChild(detailsButton);
    controls.appendChild(toggleButton);
    document.documentElement.appendChild(controls);
    return controls;
  }

  function getWatchTitle() {
    const titleElement =
      document.querySelector("ytd-watch-metadata h1 yt-formatted-string") ||
      document.querySelector("h1.title yt-formatted-string") ||
      document.querySelector("h1 yt-formatted-string");

    return titleElement ? titleElement.textContent.trim() : "";
  }

  function getWatchChannelName() {
    const channelElement =
      document.querySelector("ytd-watch-metadata #channel-name a") ||
      document.querySelector("#owner #channel-name a") ||
      document.querySelector("ytd-channel-name a");

    return channelElement ? channelElement.textContent.trim() : "";
  }

  function updateMetadata() {
    const metadata = ensureMetadata();
    const title = document.getElementById(TITLE_ID);
    const channel = document.getElementById(CHANNEL_ID);
    const onWatchPage = isWatchPage();

    if (!onWatchPage) {
      metadata.style.display = "none";
      return;
    }

    metadata.style.display = "block";
    if (title) {
      title.textContent = getWatchTitle() || "Loading title...";
    }
    if (channel) {
      const channelName = getWatchChannelName();
      channel.textContent = channelName ? channelName : "";
    }
  }

  function clearUiHideTimer() {
    if (hideUiTimeoutId !== null) {
      clearTimeout(hideUiTimeoutId);
      hideUiTimeoutId = null;
    }
  }

  function hideWatchUi() {
    document.body.classList.remove(UI_VISIBLE_CLASS);
  }

  function showWatchUi() {
    if (!isWatchPage()) {
      return;
    }
    document.body.classList.add(UI_VISIBLE_CLASS);
  }

  function scheduleUiHide() {
    clearUiHideTimer();
    hideUiTimeoutId = window.setTimeout(() => {
      hideWatchUi();
    }, HIDE_UI_DELAY_MS);
  }

  function onUserActivity() {
    if (!isWatchPage()) {
      return;
    }
    updateMetadata();
    showWatchUi();
    scheduleUiHide();
  }

  function registerUiVisibilityHandlers() {
    document.addEventListener("mousemove", onUserActivity, { passive: true });
    document.addEventListener("keydown", onUserActivity);
    document.addEventListener("touchstart", onUserActivity, { passive: true });
    window.addEventListener("blur", hideWatchUi);
  }

  function updateButtons() {
    const controls = ensureControls();
    const toggleButton = document.getElementById(BUTTON_ID);
    const detailsButton = document.getElementById(DETAILS_BUTTON_ID);
    const onWatchPage = isWatchPage();

    if (!onWatchPage) {
      controls.style.display = "none";
      return;
    }

    controls.style.display = "inline-flex";
    if (toggleButton) {
      const fullPageVisible = watchMode === WATCH_MODE_FULL;
      toggleButton.textContent = fullPageVisible ? "Hide Page" : "Show Page";
      toggleButton.setAttribute("aria-pressed", String(fullPageVisible));
      toggleButton.classList.toggle("yt-focus-btn-active", fullPageVisible);
    }

    if (detailsButton) {
      const detailsVisible = watchMode === WATCH_MODE_DETAILS;
      detailsButton.textContent = detailsVisible ? "Hide Details" : "Show Details";
      detailsButton.setAttribute("aria-pressed", String(detailsVisible));
      detailsButton.classList.toggle("yt-focus-btn-active", detailsVisible);
    }
  }

  function applyMode() {
    const onWatchPage = isWatchPage();
    const onHomePage = isHomePage();
    const focusModeEnabled = watchMode === WATCH_MODE_FOCUS;
    const detailsModeEnabled = watchMode === WATCH_MODE_DETAILS;

    if (onWatchPage && focusModeEnabled) {
      document.body.classList.add(MODE_CLASS);
    } else {
      document.body.classList.remove(MODE_CLASS);
    }
    if (onWatchPage && detailsModeEnabled) {
      document.body.classList.add(DETAILS_MODE_CLASS);
    } else {
      document.body.classList.remove(DETAILS_MODE_CLASS);
    }

    if (onHomePage) {
      document.body.classList.add(HIDE_SHORTS_CLASS);
    } else {
      document.body.classList.remove(HIDE_SHORTS_CLASS);
    }

    if (!onWatchPage) {
      hideWatchUi();
      clearUiHideTimer();
    }

    updateMetadata();
    updateButtons();
  }

  function syncForUrlChange() {
    const url = window.location.href;
    if (url === currentUrl) {
      return;
    }

    currentUrl = url;
    watchMode = WATCH_MODE_FOCUS;
    applyMode();
  }

  function startUrlWatcher() {
    currentUrl = window.location.href;
    registerUiVisibilityHandlers();
    applyMode();

    setInterval(syncForUrlChange, 500);
    setInterval(updateMetadata, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startUrlWatcher, {
      once: true
    });
  } else {
    startUrlWatcher();
  }
})();
