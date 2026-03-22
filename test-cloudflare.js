const puppeteer = require("puppeteer");

const targets = [
  { name: "Discord (Status)", url: "https://discord.com" },
  { name: "Coinbase", url: "https://www.coinbase.com" },
  { name: "ChatGPT", url: "https://chatgpt.com" },
  { name: "Cursor", url: "https://www.cursor.com" },
  { name: "Medium", url: "https://medium.com" },
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
      title.includes("Attention Required");

    if (isCloudflare) {
      // Wait for challenge to resolve
      try {
        await page.waitForFunction(
          () =>
            !document.title.includes("Just a moment") &&
            !document.title.includes("Attention Required"),
          { timeout: 15000 }
        );
        const newTitle = await page.title();
        const contentLen = (await page.content()).length;
        console.log(
          `[PASS] ${name} (${url})\n       Cloudflare detected -> bypassed! Title: "${newTitle}" | HTML: ${contentLen} chars\n`
        );
      } catch {
        console.log(
          `[FAIL] ${name} (${url})\n       Cloudflare detected -> could NOT bypass. Stuck on challenge.\n`
        );
      }
    } else {
      const contentLen = (await page.content()).length;
      console.log(
        `[PASS] ${name} (${url})\n       No Cloudflare challenge. Title: "${title}" | HTML: ${contentLen} chars\n`
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

  console.log("Testing Cloudflare-protected sites with Puppeteer...\n");

  for (const target of targets) {
    await testSite(browser, target);
  }

  await browser.close();
  console.log("Done.");
}

main();
