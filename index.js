const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
	const page = await browser.newPage();
    await page.goto("https://www.asx.com.au/asx/share-price-research/company/CBA");
    const price = await page.evaluate(() => {
		// document.querySelector(".overview-price span");
		return document.querySelector(".overview-price span").textContent;
	});
	
	console.log(price);
    await browser.close();
})();