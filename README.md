# YouTube Player Focus Mode (Chrome Extension)

This extension hides non-player content on YouTube watch pages by default, leaving the video player as the main visible element.

## Features

- Automatically enables focus mode on `youtube.com/watch` pages
- Hides surrounding content (header, comments, recommendations, side panels)
- Adds an optional details mode that reveals useful watch-page info (e.g., description and playlist controls) while still hiding recommendations/comments
- Automatically hides Shorts shelves/cards on YouTube home (`youtube.com/`)
- Shows custom in-player overlay details (video title + channel name) on watch pages
- Shows overlay UI only on mouse/keyboard/touch activity, then auto-hides
- Adds floating controls in the top-right of the overlay:
  - `Home` to navigate to YouTube home
  - `Show Details` / `Hide Details` to toggle the middle details mode
  - `Show Page` to bring back normal YouTube layout
  - `Hide Page` to re-enable focus mode

## Project files

- `manifest.json` - Extension manifest (Manifest V3)
- `content.js` - YouTube page behavior and toggle button logic
- `styles.css` - Focus mode and button styles

## Load as an unpacked developer extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this project folder.
5. Open `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (or any video).
6. The page should open in player-focus mode by default.
7. Use the top-right button to show or hide the rest of the page.

## Notes

- YouTube is a single-page app; this extension re-applies focus mode when navigating between videos.
- To remove it, go back to `chrome://extensions` and disable or remove the extension.
- Generated with Opus 4.6 and GPT-5.3 Codex using Cursor
