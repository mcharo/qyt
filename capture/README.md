# Screenshot Capture Utility

Automated screenshot capture for qyt extension documentation.

## Setup

```bash
cd capture
npm install
npx playwright install chromium
```

## Usage

```bash
npm run capture
```

This launches Chrome with the extension loaded, navigates to a YouTube video, and captures screenshots of each mode.

## Configuration

Edit `config.js` to customize:

- **viewport** — Browser window dimensions (`width`, `height`)
- **videoUrl** — YouTube video to use for screenshots
- **outputDir** — Where to save screenshots (default: `../assets`)
- **timing** — Delays for page load, control visibility, auto-hide, mode transitions
- **format** — `'jpeg'` or `'png'`
- **quality** — JPEG quality (1-100)

## Notes

- Extensions require headed mode (a visible browser window)
- YouTube may show consent dialogs; the script attempts to dismiss them
- If screenshots look wrong, try increasing timing values in config
