/* overflow-audit.cjs - renders each page headlessly and reports elements
   wider than the viewport. Usage: node tools/overflow-audit.cjs [--force-visible] */
const puppeteer = require('puppeteer-core');

const ROOT = 'file:///C:/Users/hp/portfolio/savor-bistro-new/';
const PAGES = ['index.html', 'menu.html', 'about.html', 'gallery.html', 'private-events.html', 'contact.html'];
const EXE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const FORCE = process.argv.includes('--force-visible');

async function run() {
  const browser = await puppeteer.launch({ executablePath: EXE, headless: 'new' });
  const out = [];
  for (const width of [375, 1440]) {
    for (const page of PAGES) {
      const p = await browser.newPage();
      await p.setViewport({ width, height: 900 });
      await p.goto(ROOT + page, { waitUntil: 'networkidle2', timeout: 60000 });
      if (FORCE) {
        await p.addStyleTag({ content: 'html,body{overflow:visible !important} *{overflow:visible !important}' });
      }
      await new Promise((r) => setTimeout(r, 400));
      const data = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const docW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const offenders = [];
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const overR = r.right - vw;
          const overL = -r.left;
          if (overR <= 1 && overL <= 1) continue;
          const cs = getComputedStyle(el);
          let node = el;
          let clipped = false;
          while (node && node !== document.documentElement) {
            const c = getComputedStyle(node);
            if (c.overflowX === 'hidden' || c.overflowX === 'auto' || c.overflowX === 'scroll') { clipped = true; break; }
            node = node.parentElement;
          }
          const cls = typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 8).join('.') : '';
          const id = el.id ? '#' + el.id : '';
          offenders.push({
            sel: el.tagName.toLowerCase() + id + (cls ? '.' + cls : ''),
            left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
            overR: Math.round(overR), overL: Math.round(overL),
            clipped, pos: cs.position,
            txt: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
          });
        }
        offenders.sort((a, b) => Math.max(b.overR, b.overL) - Math.max(a.overR, a.overL));
        return { vw, docW, bodyW, rootOver: docW - vw, bodyOver: bodyW - vw, offenders: offenders.slice(0, 10), total: offenders.length };
      });
      out.push({ width, page, ...data });
      await p.close();
    }
  }
  await browser.close();
  for (const r of out) {
    const flag = r.rootOver > 1 || r.bodyOver > 1 ? 'OVERFLOW' : 'ok';
    console.log('='.repeat(72));
    console.log(`[${r.width}px] ${r.page}: ${flag} docW=${r.docW} vw=${r.vw} rootOver=${r.rootOver} bodyOver=${r.bodyOver} offenders=${r.total}`);
    if (flag === 'OVERFLOW') {
      for (const o of r.offenders) {
        console.log(`   ${o.clipped ? 'clipped  ' : 'UNCLIPPED'} R+${o.overR}/L+${o.overL} [${o.left}..${o.right}] w=${o.w} pos=${o.pos} ${o.sel} :: "${o.txt}"`);
      }
    }
  }
}
run().catch((e) => { console.error('AUDIT FAIL:', e.message); process.exit(1); });
