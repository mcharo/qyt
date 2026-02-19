const { chromium } = require('playwright');
const path = require('path');
const config = require('./config');

const EXTENSION_PATH = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(__dirname, config.outputDir);

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dismissDialogs(page) {
  const selectors = [
    'button[aria-label="Accept all"]',
    'button[aria-label="Accept the use of cookies and other data for the purposes described"]',
    'button:has-text("Accept all")',
    'button:has-text("Reject all")',
    '#dismiss-button',
  ];

  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click();
        await delay(500);
      }
    } catch {}
  }
}

async function screenshot(page, name) {
  const ext = config.format === 'png' ? 'png' : 'jpg';
  const opts = {
    path: path.join(OUTPUT_DIR, `${name}.${ext}`),
    type: config.format === 'png' ? 'png' : 'jpeg',
  };
  if (config.format === 'jpeg') {
    opts.quality = config.quality;
  }
  await page.screenshot(opts);
  console.log(`  Saved: ${name}.${ext}`);
}

async function showControls(page) {
  const { width, height } = config.viewport;
  await page.mouse.move(width / 2, height / 2);
  await delay(config.timing.controlsVisible);
}

async function waitForControlsHide(page) {
  await delay(config.timing.controlsAutoHide);
}

async function main() {
  console.log('Launching browser with extension...');
  console.log(`  Viewport: ${config.viewport.width}x${config.viewport.height}`);
  console.log(`  Video: ${config.videoUrl}`);
  console.log();

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
    viewport: config.viewport,
  });

  const page = await context.newPage();

  console.log('Navigating to YouTube video...');
  await page.goto(config.videoUrl, { waitUntil: 'domcontentloaded' });

  await dismissDialogs(page);

  console.log('Waiting for extension to initialize...');
  await page.waitForSelector('#yt-player-focus-controls', { timeout: 15000 });
  await delay(config.timing.pageLoad);

  await dismissDialogs(page);

  console.log('Capturing screenshots...\n');

  // Focus mode (default)
  console.log('[Focus mode]');
  await showControls(page);
  await screenshot(page, 'focus-mode-controls');
  await waitForControlsHide(page);
  await screenshot(page, 'focus-mode');

  // Details mode
  console.log('[Details mode]');
  await showControls(page);
  await page.click('#yt-player-focus-details');
  await delay(config.timing.modeTransition);
  await showControls(page);
  await screenshot(page, 'details-mode-controls');
  await waitForControlsHide(page);
  await screenshot(page, 'details-mode');

  // Full page mode
  console.log('[Full page mode]');
  await showControls(page);
  await page.click('#yt-player-focus-toggle');
  await delay(config.timing.modeTransition);

  // Wait for YouTube player controls to be available
  await page.waitForSelector('.ytp-right-controls', { timeout: 5000 });
  await delay(500);

  // Show YouTube's native player controls via mouse movement (no clicking to avoid play/pause overlay)
  const player = page.locator('#movie_player, .html5-video-player').first();
  const playerBox = await player.boundingBox();
  
  if (playerBox) {
    const controlBarY = playerBox.y + playerBox.height - 30;
    const centerX = playerBox.x + playerBox.width / 2;
    
    // Move mouse into player area first, then down to control bar
    await page.mouse.move(centerX, playerBox.y + playerBox.height / 2);
    await delay(200);
    await page.mouse.move(centerX, controlBarY);
    await delay(300);
    
    // Gentle movement over control bar to keep controls visible
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(centerX - 50, controlBarY);
      await delay(150);
      await page.mouse.move(centerX + 50, controlBarY);
      await delay(150);
    }
    
    // Rest mouse on control bar
    await page.mouse.move(centerX, controlBarY);
  }
  
  await delay(config.timing.controlsVisible);
  
  // Verify our player buttons are visible before capturing
  try {
    await page.waitForSelector('#yt-player-focus-player-buttons', { 
      state: 'visible', 
      timeout: 3000 
    });
  } catch {
    console.log('  Warning: Player buttons may not be visible');
  }
  
  await screenshot(page, 'full-page-controls');

  console.log('\nDone! Closing browser.');
  await context.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
