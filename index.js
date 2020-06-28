require("dotenv").config();
const puppeteer = require('puppeteer');

const {
	JSON_FILE = "./sample.json"
} = process.env;

console.log(JSON_FILE);

const fs = require('fs');
const obj = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

(async () => {
    const browser = await puppeteer.launch();
	const page = await browser.newPage();
    obj.forEach(async item => {
		await getData(item, page);
	});
	
    await browser.close();
})();

async function getData(item, page){
	item.links.forEach(async link => {
		console.log(link);
		// const page = await browser.newPage();
		console.log("After new page");
		await page.goto(link);
		const data = await page.evaluate(() => {
			console.log("Inside");
			return document.querySelector(item.selector).textContent;
		});
		await page.close();
		console.log("Data isL ",data);
		writeData(item.dest, data);
	});
}

function writeData(dest, data){
	fs.writeFileSync(dest, data, {mode:"as"});
}