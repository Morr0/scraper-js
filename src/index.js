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
		let payload = { // To pass to error functions and writer ones as well
			name: linkItem.name,
			url: linkItem.url,
			selectors: item.selectors,
		};

		const page = await browser.newPage();
		// RESULTS IN EXCESSIVE CALLS
		// Timeout handling // Although requests might fail for other reason
		// page.on("requestfailed", () => {
		// 	errorHandler.timeoutOrEmptyResult(errors.SCRAPE_TIMEOUT, 
		// 		payload, Date.now());
		// });

		await page.goto(linkItem.url, {
			// in ms
			timeout: util.getTimeoutMs(item),
		});

		payload.values = await page.evaluate((item) => {
			const selectorsValues = [];
			item.selectors.forEach((selectorItem) => {
				selectorsValues.push({
					name: selectorItem.name,
					value: document.querySelector(selectorItem.selector).textContent,
				})
			});
			return selectorsValues;

			// On 1 selector
			// return document.querySelector(item.selector).textContent;
		}, item);

		// Empty value error
		// TODO deal with any value missing
		// if (!payload.value){
		// 	errorHandler.timeoutOrEmptyResult(errors.SCRAPE_EMPTY_RESULT, 
		// 		payload, Date.now());
		// }
		
		writer.write(payload);

		await page.close();
	});
}