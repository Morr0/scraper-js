const puppeteer = require('puppeteer');
const util = require("./util");
const writer = require("./writer");
const cron = require("node-cron");

(async () => {
	const browser = await puppeteer.launch();
	
	const scrapables = util.getScrapables();
	writer.init();

	scrapables.forEach(async (element) => {
		cron.schedule(element.cron, async () => {
			await getData(element, browser);
		});
	});
	
    // await browser.close();
})();

async function getData(item, browser){
	item.links.forEach(async (linkItem) => {
		console.log(linkItem);
		const page = await browser.newPage();
		await page.goto(linkItem.url, {
			// in ms
			timeout: util.getTimeoutMs(item),
		});

		const value = await page.evaluate((item) => {
			return document.querySelector(item.selector).textContent;
		}, item);
		
		writer.write(linkItem.name, value);

		await page.close();
	});
}