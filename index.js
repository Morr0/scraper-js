const puppeteer = require('puppeteer');
const util = require("./util");

(async () => {
	const browser = await puppeteer.launch();
	
	const scrapables = util.getScrapables();
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
		const data = util.getWritingTemplate(linkItem.name, value);

		util.writeData(item.dest, data);
		await page.close();
	});
}