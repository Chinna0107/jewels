const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    // Generate PDF using Puppeteer
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });`;

const newCode = `    // Generate PDF using Puppeteer
    let browser;
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      const puppeteerCore = require('puppeteer-core');
      const chromium = require('@sparticuz/chromium');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      const { default: puppeteer } = await import('puppeteer');
      browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content);
console.log("Patched puppeteer launch code.");
