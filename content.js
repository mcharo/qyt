(function () {
  const MODE_CLASS = "yt-player-focus-mode";
  const DETAILS_MODE_CLASS = "yt-player-details-mode";
  const HIDE_SHORTS_CLASS = "yt-hide-shorts-home";
  const UI_VISIBLE_CLASS = "yt-player-focus-ui-visible";
  const HIDE_UI_DELAY_MS = 3000;

  const METADATA_ID = "yt-player-focus-metadata";
  const TITLE_ID = "yt-player-focus-title";
  const CONTROLS_ID = "yt-player-focus-controls";
  const CONTROLS_TITLE_ID = "yt-player-focus-controls-title";
  const BUTTON_ID = "yt-player-focus-toggle";
  const DETAILS_BUTTON_ID = "yt-player-focus-details";
  const HOME_BUTTON_ID = "yt-player-focus-home";
  const CHANNEL_BUTTON_ID = "yt-player-focus-channel";
  const PLAYER_BUTTONS_ID = "yt-player-focus-player-buttons";
  const HOME_URL = "https://www.youtube.com/";
  const WATCH_MODE_FOCUS = "focus";
  const WATCH_MODE_DETAILS = "details";
  const WATCH_MODE_FULL = "full";

  let currentUrl = "";
  let watchMode = WATCH_MODE_FOCUS;
  let hideUiTimeoutId = null;
  let wasTheaterMode = false;

  function isWatchPage() {
    return window.location.pathname === "/watch";
  }

  function isHomePage() {
    return window.location.pathname === "/";
  }

  function isTheaterMode() {
    const watchFlexy = document.querySelector("ytd-watch-flexy");
    return watchFlexy && watchFlexy.hasAttribute("theater");
  }

  function setTheaterMode(enabled) {
    const watchFlexy = document.querySelector("ytd-watch-flexy");
    if (!watchFlexy) return;

    const currentlyTheater = watchFlexy.hasAttribute("theater");
    if (enabled === currentlyTheater) return;

    const theaterButton = document.querySelector(".ytp-size-button");
    if (theaterButton) {
      theaterButton.click();
    }
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

    metadata.appendChild(title);
    document.body.appendChild(metadata);
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

    const channelButton = document.createElement("button");
    channelButton.id = CHANNEL_BUTTON_ID;
    channelButton.type = "button";
    channelButton.textContent = "Channel";
    channelButton.setAttribute("aria-label", "Go to video channel");
    channelButton.addEventListener("click", () => {
      const url = getWatchChannelUrl();
      if (url) {
        window.location.href = url;
      }
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

    const sep1 = document.createElement("div");
    sep1.className = "yt-focus-controls-sep";

    const controlsTitle = document.createElement("span");
    controlsTitle.id = CONTROLS_TITLE_ID;

    const sep2 = document.createElement("div");
    sep2.className = "yt-focus-controls-sep yt-focus-controls-sep-end";

    controls.appendChild(homeButton);
    controls.appendChild(channelButton);
    controls.appendChild(sep1);
    controls.appendChild(controlsTitle);
    controls.appendChild(sep2);
    controls.appendChild(detailsButton);
    controls.appendChild(toggleButton);
    document.body.appendChild(controls);
    return controls;
  }

  function ensurePlayerButtons() {
    let container = document.getElementById(PLAYER_BUTTONS_ID);
    if (container && container.isConnected) {
      return container;
    }

    const rightControls = document.querySelector(
      ".ytp-right-controls-left, .ytp-right-controls"
    );
    if (!rightControls) {
      return null;
    }

    container = document.createElement("span");
    container.id = PLAYER_BUTTONS_ID;

    const detailsBtn = document.createElement("button");
    detailsBtn.className = "ytp-button yt-focus-player-btn";
    detailsBtn.dataset.action = "details";
    detailsBtn.textContent = "Show Details";
    detailsBtn.title = "Toggle details mode";
    detailsBtn.addEventListener("click", () => {
      watchMode =
        watchMode === WATCH_MODE_DETAILS ? WATCH_MODE_FOCUS : WATCH_MODE_DETAILS;
      applyMode();
    });

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ytp-button yt-focus-player-btn";
    toggleBtn.dataset.action = "toggle";
    toggleBtn.textContent = "Hide Page";
    toggleBtn.title = "Toggle full page visibility";
    toggleBtn.addEventListener("click", () => {
      watchMode = watchMode === WATCH_MODE_FULL ? WATCH_MODE_FOCUS : WATCH_MODE_FULL;
      applyMode();
    });

    container.appendChild(detailsBtn);
    container.appendChild(toggleBtn);
    rightControls.insertBefore(container, rightControls.firstChild);
    return container;
  }

  function updatePlayerButtons() {
    const fullMode = watchMode === WATCH_MODE_FULL && isWatchPage();

    if (!fullMode) {
      const existing = document.getElementById(PLAYER_BUTTONS_ID);
      if (existing) {
        existing.style.display = "none";
      }
      return;
    }

    const container = ensurePlayerButtons();
    if (!container) {
      return;
    }

    container.style.display = "";

    const detailsBtn = container.querySelector('[data-action="details"]');
    if (detailsBtn) {
      detailsBtn.textContent = "Show Details";
    }

    const toggleBtn = container.querySelector('[data-action="toggle"]');
    if (toggleBtn) {
      toggleBtn.textContent = "Hide Page";
    }
  }

  function getWatchTitle() {
    const titleElement =
      document.querySelector("ytd-watch-metadata h1 yt-formatted-string") ||
      document.querySelector("h1.title yt-formatted-string") ||
      document.querySelector("h1 yt-formatted-string");

    return titleElement ? titleElement.textContent.trim() : "";
  }

  function getWatchChannelUrl() {
    const channelLink =
      document.querySelector("ytd-watch-metadata #channel-name a") ||
      document.querySelector("#owner #channel-name a") ||
      document.querySelector("ytd-channel-name a");

    return channelLink ? channelLink.href : "";
  }

  function updateMetadata() {
    const metadata = ensureMetadata();
    const title = document.getElementById(TITLE_ID);
    const onWatchPage = isWatchPage();
    const compactControlsMode = watchMode === WATCH_MODE_FULL;

    if (!onWatchPage) {
      metadata.style.display = "none";
      return;
    }

    const titleText = getWatchTitle() || "Loading title...";

    const controlsTitle = document.getElementById(CONTROLS_TITLE_ID);
    if (controlsTitle) {
      controlsTitle.textContent = compactControlsMode ? "" : titleText;
    }

    const channelButton = document.getElementById(CHANNEL_BUTTON_ID);
    if (channelButton) {
      const channelUrl = getWatchChannelUrl();
      channelButton.disabled = !channelUrl;
    }

    if (watchMode === WATCH_MODE_DETAILS) {
      metadata.style.display = "block";
      if (title) title.textContent = titleText;
    } else {
      metadata.style.display = "none";
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
    const fullMode = watchMode === WATCH_MODE_FULL;

    if (!onWatchPage) {
      controls.style.display = "none";
      updatePlayerButtons();
      return;
    }

    controls.style.display = fullMode ? "none" : "inline-flex";

    if (toggleButton) {
      toggleButton.textContent = fullMode ? "Hide Page" : "Show Page";
      toggleButton.setAttribute("aria-pressed", String(fullMode));
      toggleButton.classList.toggle("yt-focus-btn-active", fullMode);
    }

    if (detailsButton) {
      const detailsVisible = watchMode === WATCH_MODE_DETAILS;
      detailsButton.textContent = detailsVisible ? "Hide Details" : "Show Details";
      detailsButton.setAttribute("aria-pressed", String(detailsVisible));
      detailsButton.classList.toggle("yt-focus-btn-active", detailsVisible);
    }

    updatePlayerButtons();
  }

  function applyMode() {
    const onWatchPage = isWatchPage();
    const onHomePage = isHomePage();
    const focusModeEnabled = watchMode === WATCH_MODE_FOCUS;
    const detailsModeEnabled = watchMode === WATCH_MODE_DETAILS;
    const fullModeEnabled = watchMode === WATCH_MODE_FULL;

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

    if (onWatchPage) {
      if (focusModeEnabled || detailsModeEnabled) {
        if (!isTheaterMode()) {
          wasTheaterMode = false;
          setTheaterMode(true);
        }
      } else if (fullModeEnabled && !wasTheaterMode) {
        setTheaterMode(false);
      }
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
    wasTheaterMode = isTheaterMode();
    applyMode();
  }

  function startUrlWatcher() {
    currentUrl = window.location.href;
    wasTheaterMode = isTheaterMode();
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
