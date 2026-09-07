import { chromium } from 'playwright';
import fs from 'fs';

const OUT = '/private/tmp/claude-501/-Users-drkapildevsharma-Documents-Projects-MindUrMind-mind-ur-mind-learning-lab/27e3115f-4f06-4dbb-888e-108b63f9c7cf/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });

const BREAKPOINTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x812', width: 375, height: 812 },
];

const PAGES = [
  { name: 'landing', path: '/prefrontal-power-mumbai' },
  { name: 'home', path: '/' },
];

const browser = await chromium.launch();

for (const bp of BREAKPOINTS) {
  const context = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
  const page = await context.newPage();
  for (const p of PAGES) {
    await page.goto(`http://localhost:3100${p.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${p.name}-${bp.name}-full.png`, fullPage: true });

    // Check for horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) {
      console.log(`OVERFLOW: ${p.name} @ ${bp.name}`);
    }

    // Check for broken images (after allowing lazy-load to settle)
    await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
    });
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'))
        .filter(img => img.complete && img.naturalWidth === 0)
        .map(img => img.src)
    );
    if (broken.length) console.log(`BROKEN IMAGES: ${p.name} @ ${bp.name}:`, broken);
  }
  await context.close();
}

await browser.close();
console.log('done');
