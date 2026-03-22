---
name: phantom-scrape
description: Scrape websites protected by Cloudflare, Turnstile, or other anti-bot systems. Activate when WebFetch or curl fails with 403, returns a "Just a moment" challenge page, or when the user needs to extract content from a protected website.
allowed-tools: Bash, Read, Write, Glob, Grep
---

# Phantom Scrape

Bypass Cloudflare and anti-bot protections using headless Chrome. When a URL is blocked, don't retry with HTTP clients — launch a real browser.

## When to activate

- `WebFetch` returns 403 or empty content
- `curl` returns `<title>Just a moment...</title>` or a Cloudflare challenge page
- User asks to scrape, crawl, or extract data from a website that blocks automated requests

## Setup

Ensure Puppeteer is available in the project. If not installed, run:

```bash
npm install puppeteer
```

This downloads a bundled Chromium binary (~200MB). Run in background if needed — install may take a few minutes.

## Scraping workflow

Write and execute a Node.js script using Puppeteer. Follow this pattern:

```javascript
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await page.goto(TARGET_URL, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Detect and wait out Cloudflare challenge
  const title = await page.title();
  if (
    title.includes("Just a moment") ||
    title.includes("Attention Required") ||
    title.includes("Checking your browser")
  ) {
    await page.waitForFunction(
      () =>
        !document.title.includes("Just a moment") &&
        !document.title.includes("Attention Required") &&
        !document.title.includes("Checking your browser"),
      { timeout: 30000 }
    );
  }

  // Extract content
  const data = await page.evaluate(() => {
    return {
      title: document.title,
      text: document.body.innerText,
      links: Array.from(document.querySelectorAll("a")).map((a) => ({
        text: a.textContent.trim(),
        href: a.href,
      })),
    };
  });

  console.log(JSON.stringify(data, null, 2));

  // Screenshot for visual verification
  await page.screenshot({ path: "screenshot.png", fullPage: true });

  await browser.close();
})();
```

### Critical settings

| Setting | Value | Reason |
|---|---|---|
| `headless` | `"new"` | New headless mode — less detectable than legacy `true` |
| `waitUntil` | `"networkidle2"` | Ensures JS-rendered content is fully loaded |
| `timeout` | `60000` | Cloudflare challenges need time to solve |
| User-Agent | Real Chrome string | Prevents immediate headless detection |

## Escalation: stealth mode

If basic Puppeteer gets detected (Turnstile CAPTCHA, advanced fingerprinting), escalate to stealth mode:

```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth
```

```javascript
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Then launch as normal — stealth patches headless detection vectors:
// WebGL, Canvas, Chrome.runtime, navigator.plugins, etc.
const browser = await puppeteer.launch({ headless: "new" });
```

## Multi-page crawling

When scraping across multiple pages, reuse the browser instance and add delays between requests:

```javascript
const browser = await puppeteer.launch({ headless: "new" });

for (const url of urls) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  // ... extract data ...
  await page.close();
  // Respectful delay between requests
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));
}

await browser.close();
```

## Rules

1. Always call `browser.close()` — orphaned Chrome processes leak memory
2. Always set a realistic User-Agent string
3. Use `page.screenshot()` when debugging to see what the browser actually renders
4. For large scraping jobs, write extracted data to a JSON file rather than logging to stdout
5. Never hardcode credentials or tokens in scraping scripts
