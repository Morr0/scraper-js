const puppeteer = require('puppeteer');
const cron = require("node-cron");

const util = require("./util/util");
const writer = require("./writer");
const errorHandler = require("./error/errorHanlder");
const errors = require("./error/errors");

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
		const page = await browser.newPage();
		// Timeout handling // Although requests might fail for other reason
		page.on("requestfailed", () => {
			errorHandler.timeoutOrEmptyResult(errors.SCRAPE_TIMEOUT,
				{
					name: linkItem.name,
					url: linkItem.url,
					selector: item.selector,
				}, Date.now());
		});

		await page.goto(linkItem.url, {
			// in ms
			timeout: util.getTimeoutMs(item),
		});

		const value = await page.evaluate((item) => {
			return document.querySelector(item.selector).textContent;
		}, item);

		// Empty value error
		if (!value){
			errorHandler.timeoutOrEmptyResult(errors.SCRAPE_EMPTY_RESULT,
				{
					name: linkItem.name,
					url: linkItem.url,
					selector: item.selector,
				}, Date.now());
		}
		
		writer.write(linkItem.name, value);

		await page.close();
	});
}