const puppeteer = require("puppeteer");

async function scrapeSkills() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  console.log("Navigating to skillsmp.com...");
  await page.goto("https://skillsmp.com/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Wait for Cloudflare challenge to resolve
  console.log("Waiting for page to load past Cloudflare...");
  await page.waitForFunction(
    () => !document.title.includes("Just a moment"),
    { timeout: 30000 }
  );

  console.log("Page loaded. Title:", await page.title());

  // Get the full page HTML for analysis
  const content = await page.content();
  console.log("\n--- Page HTML (first 5000 chars) ---\n");
  console.log(content.substring(0, 5000));

  // Try to extract any skill-related links or content
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map((a) => ({
      text: a.textContent.trim(),
      href: a.href,
    }));
  });

  console.log("\n--- All links on page ---\n");
  links.forEach((l) => console.log(`${l.text} -> ${l.href}`));

  // Take a screenshot for reference
  await page.screenshot({ path: "skillsmp-homepage.png", fullPage: true });
  console.log("\nScreenshot saved to skillsmp-homepage.png");

  await browser.close();
}

scrapeSkills().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
