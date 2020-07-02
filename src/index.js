const puppeteer = require('puppeteer');
const CronJob = require("cron").CronJob;

const util = require("./util/util");
const writer = require("./writer");
const errorHandler = require("./error/errorHanlder");
const errors = require("./error/errors");
const { TimeoutError } = require('puppeteer/Errors');

(async () => {
	const browser = await puppeteer.launch();
	
	const scrapables = util.getScrapables();
	writer.init();

	scrapables.forEach(async (element) => {
		new CronJob(element.cron, async () => {
			await getData(element, browser);
		}, null, true, undefined, undefined, true);
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

        try {
            const page = await browser.newPage();
            // Use the bottom only when looking for logs from within the page
            // page.on("console", (log) => console.log(JSON.stringify(log._text)));

            await page.goto(linkItem.url, {
                // in ms
                // timeout: 100,
                timeout: util.getTimeoutMs(item),
            });

            payload.values = await page.evaluate((item) => {

                // Destructure passed in args
                const selectorsValues = [];
                // Loop over each selector and query it
                item.selectors.forEach((selectorItem) => { 
                    // One or no values
                    if (!item.multiple){
                        const selected = document.querySelector(selectorItem.selector);
                        // Construct the value and push it to the array
                        selectorsValues.push({
                            name: selectorItem.name,
                            value: selected? selected.textContent: "",
                        });

                    } else { // Multiple values
                        const selected = document.querySelectorAll(selectorItem.selector);
                        let values = [];
                        selected.forEach((value) => {
                            values.push(value.textContent);
                        });

                        selectorsValues.push({
                            name: selectorItem.name,
                            value: values,
                        });
                    }
                    
                });
                return selectorsValues;

                // On 1 selector
                // return document.querySelector(item.selector).textContent;
            }, item);

            // Empty values error
            if (item.selectors.length !== payload.values.length){
                errorHandler.timeoutOrEmptyResult(errors.SCRAPE_EMPTY_RESULTS, 
                    payload, Date.now());
                console.log("Got an empty");
            }
            
            writer.write(payload);

            await page.close();
        } catch (e) {
            if (e instanceof TimeoutError){
                errorHandler.timeoutOrEmptyResult(errors.SCRAPE_TIMEOUT, payload, Date.now());
            }
        }
	});
}