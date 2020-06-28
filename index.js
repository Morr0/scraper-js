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
	item.links.forEach(async (link) => {
		console.log(link);
		const page = await browser.newPage();
		await page.goto(link);

		const data = await page.evaluate((item) => {
			return document.querySelector(item.selector).textContent;
		}, item);

		console.log("Data isL ", data);
		util.writeData(item.dest, data);
		await page.close();
	});
}