const puppeteer = require("puppeteer");

const targets = [
  { name: "Nowsecure (反爬测试站)", url: "https://nowsecure.nl" },
  { name: "Bet365", url: "https://www.bet365.com" },
  { name: "Canva", url: "https://www.canva.com" },
  { name: "Zeabur", url: "https://zeabur.com" },
  { name: "SkillsMP", url: "https://skillsmp.com" },
];

async function testSite(browser, { name, url }) {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const title = await page.title();
    const isCloudflare =
      title.includes("Just a moment") ||
      title.includes("Attention Required") ||
      title.includes("Checking your browser");

    if (isCloudflare) {
      console.log(`[...] ${name} — Cloudflare challenge detected, waiting...`);
      try {
        await page.waitForFunction(
          () =>
            !document.title.includes("Just a moment") &&
            !document.title.includes("Attention Required") &&
            !document.title.includes("Checking your browser"),
          { timeout: 20000 }
        );
        const newTitle = await page.title();
        const contentLen = (await page.content()).length;
        console.log(
          `[PASS] ${name} (${url})\n       Cloudflare BYPASSED! Title: "${newTitle}" | HTML: ${contentLen} chars\n`
        );
      } catch {
        console.log(
          `[FAIL] ${name} (${url})\n       Cloudflare NOT bypassed — stuck on challenge page.\n`
        );
      }
    } else {
      const contentLen = (await page.content()).length;
      console.log(
        `[PASS] ${name} (${url})\n       No challenge. Title: "${title}" | HTML: ${contentLen} chars\n`
      );
    }
  } catch (err) {
    console.log(`[FAIL] ${name} (${url})\n       Error: ${err.message}\n`);
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log("Testing stricter Cloudflare-protected sites...\n");

  for (const target of targets) {
    await testSite(browser, target);
  }

  await browser.close();
  console.log("Done.");
}

main();
