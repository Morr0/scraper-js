# Scraper for my own use

Feel free to use it. Duplicate sample.json to your liking. Include the link to your file in .env.

Each scrape request will have a timeout of 75% of the time difference between the crontab time specified for each scrape.

sample.json attributes: 
- selectors = array of HTML selector querys
- multiple = in case of an array of values for each selector. If true -> grab all, else only the first
- cron = cronjob syntax on when to run the scrape.
- links = an array of links to scrape sequentially. A name/url pair.

## Writing the results: 
Values can be written to a file, REST api and MongoDB insert. You can use all 3 methods.

- To write to a file, just include the name of the file in your .env as the attribute `FILE_DEST`. **Consider not using this method, or make your own file format since it is for testing only currently**.

- To write in a POST API request:
    - Include the rest endpoint (must be the same for HEAD and POST methods) in .env as `API_POST_CALL`.
    - Implement a HEAD method that gets called only once at the start of the application for initialization purposes. **If it does not return a status of 200 will not proceed the POST API calls**.
    - Implement a POST method that recieves the body as `{name, value}` json formatted. Where `name` is the name of the link and the `value` is the value extracted out of the website.
    - Check `test/server/` for an example of the REST server.

- To write to a MongoDB database, use the environment variables described in `.sample.env` in your environment configuration. This will write in the same collection forever. To customize this visit the section below.

## Customizing MongoDB writing: DO NOT CUSTOMIZE (NOT WORKING PROPERLY)
Firstly, link the `.env` environment variable to a .json file to use for config. When successfully linked, will ignore the environment variable `MONGODB_COLLECTION`.