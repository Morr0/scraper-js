const puppeteer = require('puppeteer');
const util = require("./util");
const writer = require("./writer");
const job = require("./job");

(async () => {
	const browser = await puppeteer.launch();
	
	const scrapables = util.getScrapables();
	const employer = job.initTimers(scrapables);
	writer.init();

	scrapables.forEach(async (element) => {
		console.log("Loop");
		await getData(element, browser);
	});
	
    // await browser.close();
})();

async function getData(item, browser){
	item.links.forEach(async (linkItem) => {
		console.log(linkItem);
		const page = await browser.newPage();
		await page.goto(linkItem.url, {
			// in ms
			timeout: 60000  // TODO deal with timeouts
		});

		const value = await page.evaluate((item) => {
			return document.querySelector(item.selector).textContent;
		}, item);
		
		writer.write(linkItem.name, value);

		await page.close();
	});
}